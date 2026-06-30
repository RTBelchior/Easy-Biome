package pt.easybiome.easybiome_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import pt.easybiome.easybiome_api.model.LeituraSensor;
import pt.easybiome.easybiome_api.repository.LeituraSensorRepository;

import java.util.List;

@RestController
@RequestMapping("/api/leituras")
public class LeituraSensorController {

    @Autowired
    private LeituraSensorRepository repository;

    @PostMapping
    public LeituraSensor guardar(@RequestBody LeituraSensor leitura) {
        return repository.save(leitura);
    }

    @GetMapping
    public List<LeituraSensor> listar() {
        return repository.findAll();
    }
}