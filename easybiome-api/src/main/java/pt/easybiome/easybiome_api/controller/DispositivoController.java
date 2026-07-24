package pt.easybiome.easybiome_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import pt.easybiome.easybiome_api.model.Dispositivo;
import pt.easybiome.easybiome_api.service.CryptoService;
import pt.easybiome.easybiome_api.service.DispositivoService;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@RestController
@RequestMapping("/api/dispositivos")
@CrossOrigin(origins = "*")
public class DispositivoController {

    @Autowired
    private DispositivoService service;

    @Autowired
    private CryptoService cryptoService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/terrario/{idTerrario}")
    public String listar(
            @PathVariable Long idTerrario) {

        try {

            // Obter dispositivos
            List<Dispositivo> dispositivos =
                    service.listarPorTerrario(
                            idTerrario
                    );

            // Converter para JSON
            String json =
                    objectMapper.writeValueAsString(
                            dispositivos
                    );

            System.out.println(
                    "JSON dos dispositivos:"
            );

            System.out.println(json);

            // Encriptar
            return cryptoService.encriptar(json);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Erro ao encriptar dispositivos",
                    e
            );
        }
    }

    @PutMapping("/{id}")
    public Dispositivo alterarEstado(
            @PathVariable Long id,
            @RequestBody Dispositivo dispositivo) {

        System.out.println("ID Utilizador: " + dispositivo.getIdUtilizador());

        return service.alterarEstado(
                id,
                dispositivo.getEstadoAtual(),
                dispositivo.getModoManual(),
                dispositivo.getIdUtilizador()
        );
    }
}