package pt.easybiome.easybiome_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import pt.easybiome.easybiome_api.model.Dispositivo;
import pt.easybiome.easybiome_api.model.LogComando;
import pt.easybiome.easybiome_api.repository.DispositivoRepository;
import pt.easybiome.easybiome_api.repository.LogComandoRepository;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/dispositivos")
@CrossOrigin(origins = "*")
public class DispositivoController {

    @Autowired
    private DispositivoRepository repository;

    @Autowired
    private LogComandoRepository logRepository;

    @GetMapping("/terrario/{idTerrario}")
    public List<Dispositivo> listar(@PathVariable Long idTerrario) {
        return repository.findByIdTerrario(idTerrario);
    }

    @PutMapping("/{id}")
    public Dispositivo alterarEstado(
            @PathVariable Long id,
            @RequestBody Dispositivo dispositivo) {

        Dispositivo d = repository.findById(id).orElseThrow();

        Boolean estadoAnterior = d.getEstadoAtual();

        d.setEstadoAtual(dispositivo.getEstadoAtual());
        d.setAtualizadoEm(LocalDateTime.now());

        Dispositivo atualizado = repository.save(d);

        LogComando log = new LogComando();
        log.setIdDispositivo(d.getIdDispositivo());
        log.setIdUtilizador(1L); // temporário
        log.setEstadoAnterior(estadoAnterior);
        log.setEstadoNovo(d.getEstadoAtual());
        log.setOrigemLog("APP");
        log.setExecutadoEm(LocalDateTime.now());

        logRepository.save(log);

        return atualizado;
    }

}