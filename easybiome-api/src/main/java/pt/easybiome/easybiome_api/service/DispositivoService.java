package pt.easybiome.easybiome_api.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pt.easybiome.easybiome_api.model.Dispositivo;
import pt.easybiome.easybiome_api.model.LogComando;
import pt.easybiome.easybiome_api.repository.DispositivoRepository;
import pt.easybiome.easybiome_api.repository.LogComandoRepository;

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

    public Dispositivo alterarEstado(
            Long idDispositivo,
            boolean novoEstado,
            Boolean modoManual,
            Long idUtilizador) {
        System.out.println("idUtilizador recebido = " + idUtilizador);

        Dispositivo dispositivo = dispositivoRepository.findById(idDispositivo)
                .orElseThrow(() -> new RuntimeException("Dispositivo não encontrado"));

        Boolean estadoAnterior = dispositivo.getEstadoAtual();
        Boolean modoAnterior = dispositivo.getModoManual();

        // Alteração do estado do dispositivo
        if (!estadoAnterior.equals(novoEstado)) {

            dispositivo.setEstadoAtual(novoEstado);

            registarLog(
                    idDispositivo,
                    estadoAnterior,
                    novoEstado,
                    "APP",
                    idUtilizador,
                    novoEstado ? "LIGAR" : "DESLIGAR",
                    dispositivo.getNomeDispositivo() +
                            (novoEstado
                                    ? " ligado pelo utilizador"
                                    : " desligado pelo utilizador")
            );
        }

        // Alteração do modo manual/automático
        if (modoManual != null && !modoAnterior.equals(modoManual)) {

            dispositivo.setModoManual(modoManual);

            registarLog(
                    idDispositivo,
                    dispositivo.getEstadoAtual(),
                    dispositivo.getEstadoAtual(),
                    "APP",
                    idUtilizador,
                    modoManual ? "MODO_MANUAL" : "MODO_AUTOMATICO",
                    (modoManual
                            ? "Modo manual ativado para "
                            : "Modo automático ativado para ")
                            + dispositivo.getNomeDispositivo()
            );
        }

        return dispositivoRepository.save(dispositivo);
    }

    public void registarLog(
            Long idDispositivo,
            Boolean estadoAnterior,
            Boolean estadoNovo,
            String origem,
            Long idUtilizador,
            String acao,
            String descricao) {

        LogComando log = new LogComando();

        log.setIdDispositivo(idDispositivo);
        log.setIdUtilizador(idUtilizador);
        log.setEstadoAnterior(estadoAnterior);
        log.setEstadoNovo(estadoNovo);
        log.setOrigemLog(origem);
        log.setAcao(acao);
        log.setDescricao(descricao);
        log.setExecutadoEm(LocalDateTime.now());

        logComandoRepository.save(log);
    }
}