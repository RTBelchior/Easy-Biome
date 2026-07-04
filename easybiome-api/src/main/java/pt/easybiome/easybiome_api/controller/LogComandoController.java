package pt.easybiome.easybiome_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import pt.easybiome.easybiome_api.model.LogComando;
import pt.easybiome.easybiome_api.repository.LogComandoRepository;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class LogComandoController {

    @Autowired
    private LogComandoRepository repository;

    @GetMapping
    public List<LogComando> listarTodos() {
        return repository.findAllByOrderByExecutadoEmDesc();
    }

    @GetMapping("/terrario/{idTerrario}")
    public List<LogComando> listarPorTerrario(@PathVariable Long idTerrario) {
        return repository.findByTerrario(idTerrario);
    }
}