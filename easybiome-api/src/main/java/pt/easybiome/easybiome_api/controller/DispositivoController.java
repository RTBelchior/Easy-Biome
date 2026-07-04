package pt.easybiome.easybiome_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import pt.easybiome.easybiome_api.model.Dispositivo;
import pt.easybiome.easybiome_api.service.DispositivoService;

import java.util.List;

@RestController
@RequestMapping("/api/dispositivos")
@CrossOrigin(origins = "*")
public class DispositivoController {

    @Autowired
    private DispositivoService service;

    @GetMapping("/terrario/{idTerrario}")
    public List<Dispositivo> listar(@PathVariable Long idTerrario) {
        return service.listarPorTerrario(idTerrario);
    }

    @PutMapping("/{id}")
    public Dispositivo alterarEstado(
            @PathVariable Long id,
            @RequestBody Dispositivo dispositivo) {

        return service.alterarEstado(
                id,
                dispositivo.getEstadoAtual(),
                dispositivo.getModoManual()
        );
    }
}