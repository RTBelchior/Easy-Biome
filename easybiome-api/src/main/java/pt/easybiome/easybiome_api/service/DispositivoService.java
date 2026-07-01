package pt.easybiome.easybiome_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pt.easybiome.easybiome_api.model.Dispositivo;
import pt.easybiome.easybiome_api.model.LogComando;
import pt.easybiome.easybiome_api.repository.DispositivoRepository;
import pt.easybiome.easybiome_api.repository.LogComandoRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DispositivoService {

    @Autowired
    private DispositivoRepository dispositivoRepository;

    @Autowired
    private LogComandoRepository logComandoRepository;

    public List<Dispositivo> listarTodos() {
        return dispositivoRepository.findAll();
    }

    public List<Dispositivo> listarPorTerrario(Long idTerrario) {
        return dispositivoRepository.findByIdTerrario(idTerrario);
    }

    public Dispositivo alterarEstado(Long idDispositivo, boolean novoEstado) {

        Dispositivo dispositivo = dispositivoRepository.findById(idDispositivo)
                .orElseThrow(() -> new RuntimeException("Dispositivo não encontrado"));

        Boolean estadoAnterior = dispositivo.getEstadoAtual();

        dispositivo.setEstadoAtual(novoEstado);

        dispositivo = dispositivoRepository.save(dispositivo);

        LogComando log = new LogComando();
        log.setIdDispositivo(idDispositivo);
        log.setIdUtilizador(null); // depois colocamos o utilizador autenticado
        log.setEstadoAnterior(estadoAnterior);
        log.setEstadoNovo(novoEstado);
        log.setOrigemLog("APP");
        log.setExecutadoEm(LocalDateTime.now());

        logComandoRepository.save(log);

        return dispositivo;
    }

}