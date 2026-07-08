package pt.easybiome.easybiome_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import pt.easybiome.easybiome_api.dto.LogComandoDTO;
import pt.easybiome.easybiome_api.model.Dispositivo;
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
    public List<LogComandoDTO> listarPorTerrario(@PathVariable Long idTerrario) {

        List<Object[]> resultado = repository.findByTerrario(idTerrario);

        return resultado.stream().map(r -> {

            LogComando log = (LogComando) r[0];
            Dispositivo dispositivo = (Dispositivo) r[1];

            LogComandoDTO dto = new LogComandoDTO();

            dto.setId(log.getId());
            dto.setIdDispositivo(log.getIdDispositivo());
            dto.setTipoDispositivo(dispositivo.getTipoDispositivo());
            dto.setIdUtilizador(log.getIdUtilizador());
            dto.setEstadoAnterior(log.getEstadoAnterior());
            dto.setEstadoNovo(log.getEstadoNovo());
            dto.setOrigemLog(log.getOrigemLog());
            dto.setAcao(log.getAcao());
            dto.setDescricao(log.getDescricao());
            dto.setExecutadoEm(log.getExecutadoEm());

            return dto;
        }).toList();
    }
}