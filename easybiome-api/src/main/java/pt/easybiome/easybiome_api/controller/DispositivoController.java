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


    // ============================================================
    // 1. LISTAR DISPOSITIVOS - SITE
    //
    // Este endpoint devolve JSON NORMAL.
    //
    // O JavaScript do site utiliza este endpoint para:
    // - saber quais são os dispositivos
    // - obter o idDispositivo
    // - guardar fanId, heatId, lightId e humidifierId
    //
    // URL:
    // GET /api/dispositivos/terrario/{idTerrario}
    //
    // Exemplo:
    // GET /api/dispositivos/terrario/3
    // ============================================================

    @GetMapping("/terrario/{idTerrario}")
    public List<Dispositivo> listar(
            @PathVariable Long idTerrario) {

        return service.listarPorTerrario(idTerrario);
    }


    // ============================================================
    // 2. LISTAR DISPOSITIVOS - ESP32
    //
    // Este endpoint devolve os dispositivos ENCRIPTADOS.
    //
    // O ESP32 utiliza este endpoint para obter:
    // - estadoAtual
    // - tipoDispositivo
    // - modoManual
    //
    // URL:
    // GET /api/dispositivos/terrario/{idTerrario}/cifrado
    //
    // Exemplo:
    // GET /api/dispositivos/terrario/3/cifrado
    // ============================================================

    @GetMapping("/terrario/{idTerrario}/cifrado")
    public String listarCifrado(
            @PathVariable Long idTerrario) {

        try {

            // Obter dispositivos da BD
            List<Dispositivo> dispositivos =
                    service.listarPorTerrario(idTerrario);


            // Converter para JSON
            String json =
                    objectMapper.writeValueAsString(
                            dispositivos
                    );


            System.out.println(
                    "JSON dos dispositivos para ESP32:"
            );

            System.out.println(json);


            // Encriptar JSON
            String jsonCifrado =
                    cryptoService.encriptar(json);


            System.out.println(
                    "JSON cifrado:"
            );

            System.out.println(jsonCifrado);


            return jsonCifrado;


        } catch (Exception e) {

            throw new RuntimeException(
                    "Erro ao encriptar dispositivos",
                    e
            );
        }
    }


    // ============================================================
    // 3. ALTERAR ESTADO DO DISPOSITIVO
    //
    // Utilizado pelo SITE.
    //
    // URL:
    // PUT /api/dispositivos/{id}
    //
    // Exemplo:
    // PUT /api/dispositivos/11
    //
    // Body:
    //
    // {
    //   "estadoAtual": true,
    //   "modoManual": true,
    //   "idUtilizador": 1
    // }
    // ============================================================

    @PutMapping("/{id}")
    public Dispositivo alterarEstado(
            @PathVariable Long id,
            @RequestBody Dispositivo dispositivo) {


        System.out.println(
                "ID Dispositivo: " + id
        );


        System.out.println(
                "Estado Atual: " +
                        dispositivo.getEstadoAtual()
        );


        System.out.println(
                "Modo Manual: " +
                        dispositivo.getModoManual()
        );


        System.out.println(
                "ID Utilizador: " +
                        dispositivo.getIdUtilizador()
        );


        return service.alterarEstado(
                id,
                dispositivo.getEstadoAtual(),
                dispositivo.getModoManual(),
                dispositivo.getIdUtilizador()
        );
    }
}