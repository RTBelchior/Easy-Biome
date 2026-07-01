package pt.easybiome.easybiome_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import pt.easybiome.easybiome_api.model.Dispositivo;
import pt.easybiome.easybiome_api.repository.DispositivoRepository;

import java.util.List;

@RestController
@RequestMapping("/api/dispositivos")
@CrossOrigin(origins = "*")
public class DispositivoController {

    @Autowired
    private DispositivoRepository repository;

    @GetMapping("/terrario/{idTerrario}")
    public List<Dispositivo> listar(@PathVariable Long idTerrario) {
        return repository.findByIdTerrario(idTerrario);
    }

    @PutMapping("/{id}")
    public Dispositivo alterarEstado(
            @PathVariable Long id,
            @RequestBody Dispositivo dispositivo) {

        Dispositivo d = repository.findById(id).orElseThrow();

        // Atualiza o estado
        d.setEstadoAtual(dispositivo.getEstadoAtual());

        // Se vier definido, passa para modo manual ou automático
        if (dispositivo.getModoManual() != null) {
            d.setModoManual(dispositivo.getModoManual());
        }

        return repository.save(d);
    }

}