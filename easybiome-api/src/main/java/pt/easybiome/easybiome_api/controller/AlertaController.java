package pt.easybiome.easybiome_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pt.easybiome.easybiome_api.model.Alerta;
import pt.easybiome.easybiome_api.service.AlertaService;

import java.util.List;

@RestController
@RequestMapping("/api/alertas")
@CrossOrigin(origins = "*")
public class AlertaController {

    @Autowired
    private AlertaService alertaService;

    @GetMapping("/terrario/{id}")
    public List<Alerta> listar(@PathVariable Long id) {
        return alertaService.listarPorTerrario(id);
    }
}