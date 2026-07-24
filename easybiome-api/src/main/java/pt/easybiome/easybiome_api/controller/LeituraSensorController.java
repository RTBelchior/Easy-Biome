package pt.easybiome.easybiome_api.controller;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import pt.easybiome.easybiome_api.model.Dispositivo;
import pt.easybiome.easybiome_api.model.LeituraSensor;
import pt.easybiome.easybiome_api.model.Terrario;
import pt.easybiome.easybiome_api.repository.DispositivoRepository;
import pt.easybiome.easybiome_api.repository.LeituraSensorRepository;
import pt.easybiome.easybiome_api.repository.TerrarioRepository;
import pt.easybiome.easybiome_api.service.AlertaService;
import pt.easybiome.easybiome_api.service.CryptoService;
import pt.easybiome.easybiome_api.service.DispositivoService;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/leituras")
@CrossOrigin(origins = "*")
public class LeituraSensorController {

    @Autowired
    private LeituraSensorRepository repository;

    @Autowired
    private TerrarioRepository terrarioRepository;

    @Autowired
    private DispositivoRepository dispositivoRepository;

    @Autowired
    private DispositivoService dispositivoService;

    @Autowired
    private AlertaService alertaService;

    @Autowired
    private CryptoService cryptoService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping
    public LeituraSensor guardar(@RequestBody String mensagemCifrada) {

        try {

            // ==========================================================
            // 1. DESENCRIPTAR MENSAGEM DO ESP32
            // ==========================================================

            String json =
                    cryptoService.desencriptar(mensagemCifrada);

            System.out.println(
                    "JSON recebido do ESP32:"
            );

            System.out.println(json);

            // ==========================================================
            // 2. CONVERTER JSON PARA LeituraSensor
            // ==========================================================

            LeituraSensor leitura =
                    objectMapper.readValue(
                            json,
                            LeituraSensor.class
                    );

            // ==========================================================
            // 3. LÓGICA NORMAL DA APLICAÇÃO
            // ==========================================================

            LeituraSensor leituraGuardada =
                    repository.save(leitura);

            Terrario terrario =
                    terrarioRepository
                            .findById(leitura.getIdTerrario())
                            .orElseThrow();

            alertaService.verificarAlertas(
                    terrario,
                    leitura
            );

            for (Dispositivo d :
                    dispositivoRepository
                            .findByIdTerrario(
                                    leitura.getIdTerrario()
                            )) {

                if (Boolean.TRUE.equals(
                        d.getModoManual())) {

                    continue;
                }

                Boolean estadoAnterior =
                        d.getEstadoAtual();

                switch (d.getTipoDispositivo()) {

                    case "LAMPADA_AQUECIMENTO":

                        d.setEstadoAtual(
                                leitura.getTemperatura()
                                        < terrario
                                        .getTempTerrarioMin()
                        );

                        break;

                    case "VENTOINHA":

                        d.setEstadoAtual(
                                leitura.getTemperatura()
                                        > terrario
                                        .getTempTerrarioMax()
                        );

                        break;

                    case "HUMIDIFICADOR":

                        if (leitura.getHumidade()
                                < terrario
                                .getHumidadeTerrarioMin()) {

                            d.setEstadoAtual(true);

                        } else if (
                                leitura.getHumidade()
                                        > terrario
                                        .getHumidadeTerrarioMax()) {

                            d.setEstadoAtual(false);
                        }

                        break;

                    case "LAMPADA_ILUMINACAO":

                        LocalTime agora =
                                LocalTime.now();

                        boolean ligada =
                                !agora.isBefore(
                                        terrario
                                                .getHoraLigarIluminacao()
                                )
                                        &&
                                        agora.isBefore(
                                                terrario
                                                        .getHoraDesligarIluminacao()
                                        );

                        d.setEstadoAtual(ligada);

                        break;
                }

                if (!estadoAnterior.equals(
                        d.getEstadoAtual())) {

                    dispositivoRepository.save(d);

                    String acao =
                            d.getEstadoAtual()
                                    ? "LIGAR"
                                    : "DESLIGAR";

                    String descricao =
                            d.getNomeDispositivo()
                                    +
                                    (
                                            d.getEstadoAtual()
                                                    ? " ligado automaticamente"
                                                    : " desligado automaticamente"
                                    );

                    dispositivoService.registarLog(
                            d.getIdDispositivo(),
                            estadoAnterior,
                            d.getEstadoAtual(),
                            "AUTOMATICO",
                            null,
                            acao,
                            descricao
                    );
                }
            }

            return leituraGuardada;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Erro ao processar mensagem cifrada",
                    e
            );
        }
    }

    @GetMapping("/ultima/{idTerrario}")
    public LeituraSensor ultimaLeitura(@PathVariable Long idTerrario) {
        return repository.findTopByIdTerrarioOrderByRegistadoEmDesc(idTerrario);
    }

    @GetMapping("/historico/{idTerrario}")
    public List<LeituraSensor> historico(
            @PathVariable Long idTerrario,
            @RequestParam(defaultValue = "24") int horas) {

        LocalDateTime inicio = LocalDateTime.now().minusHours(horas);

        return repository.findByIdTerrarioAndRegistadoEmAfterOrderByRegistadoEmAsc(
                idTerrario,
                inicio
        );
    }


}