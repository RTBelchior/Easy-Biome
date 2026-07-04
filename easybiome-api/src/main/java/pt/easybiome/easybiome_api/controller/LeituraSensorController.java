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
import pt.easybiome.easybiome_api.service.DispositivoService;

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

    @PostMapping
    public LeituraSensor guardar(@RequestBody LeituraSensor leitura) {

        LeituraSensor leituraGuardada = repository.save(leitura);

        Terrario terrario = terrarioRepository
                .findById(leitura.getIdTerrario())
                .orElseThrow();

        for (Dispositivo d : dispositivoRepository.findByIdTerrario(leitura.getIdTerrario())) {

            if (Boolean.TRUE.equals(d.getModoManual())) {
                continue;
            }

            Boolean estadoAnterior = d.getEstadoAtual();

            switch (d.getTipoDispositivo()) {

                case "LAMPADA_AQUECIMENTO":

                    d.setEstadoAtual(
                            leitura.getTemperatura() < terrario.getTempTerrarioMin());

                    break;

                case "VENTOINHA":

                    d.setEstadoAtual(
                            leitura.getTemperatura() > terrario.getTempTerrarioMax());

                    break;

                case "HUMIDIFICADOR":

                    if (leitura.getHumidade() < terrario.getHumidadeTerrarioMin()) {
                        d.setEstadoAtual(true);

                    } else if (leitura.getHumidade() > terrario.getHumidadeTerrarioMax()) {
                        d.setEstadoAtual(false);
                    }

                    break;

                case "LAMPADA_ILUMINACAO":

                    LocalTime agora = LocalTime.now();

                    boolean ligada =
                            !agora.isBefore(terrario.getHoraLigarIluminacao())
                                    && agora.isBefore(terrario.getHoraDesligarIluminacao());

                    d.setEstadoAtual(ligada);

                    break;
            }

            if (!estadoAnterior.equals(d.getEstadoAtual())) {

                dispositivoRepository.save(d);

                String acao = d.getEstadoAtual() ? "LIGAR" : "DESLIGAR";

                String descricao = d.getNomeDispositivo()
                        + (d.getEstadoAtual()
                        ? " ligado automaticamente"
                        : " desligado automaticamente");

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