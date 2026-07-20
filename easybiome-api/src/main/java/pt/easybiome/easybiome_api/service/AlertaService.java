package pt.easybiome.easybiome_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pt.easybiome.easybiome_api.model.Alerta;
import pt.easybiome.easybiome_api.model.LeituraSensor;
import pt.easybiome.easybiome_api.model.Terrario;
import pt.easybiome.easybiome_api.repository.AlertaRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertaService {

    @Autowired
    private AlertaRepository alertaRepository;

    public List<Alerta> listarPorTerrario(Long idTerrario) {
        return alertaRepository.findByTerrarioIdTerrarioOrderByCriadoEmDesc(idTerrario);
    }

    public void verificarAlertas(Terrario terrario, LeituraSensor leitura) {

        // Temperatura baixa
        if (leitura.getTemperatura() < terrario.getTempTerrarioMin()) {
            criarAlerta(
                    terrario,
                    "TEMPERATURA_BAIXA",
                    "Temperatura abaixo do mínimo.",
                    leitura.getTemperatura().doubleValue(),
                    terrario.getTempTerrarioMin().doubleValue()); // mínimo
        } else {
            resolverAlerta(terrario, "TEMPERATURA_BAIXA");
        }

// Temperatura alta
        if (leitura.getTemperatura() > terrario.getTempTerrarioMax()) {
            criarAlerta(
                    terrario,
                    "TEMPERATURA_ALTA",
                    "Temperatura acima do máximo.",
                    leitura.getTemperatura().doubleValue(),
                    terrario.getTempTerrarioMax().doubleValue()); // máximo
        } else {
            resolverAlerta(terrario, "TEMPERATURA_ALTA");
        }

// Humidade baixa
        if (leitura.getHumidade() < terrario.getHumidadeTerrarioMin()) {
            criarAlerta(
                    terrario,
                    "HUMIDADE_BAIXA",
                    "Humidade abaixo do mínimo.",
                    leitura.getHumidade().doubleValue(),
                    terrario.getHumidadeTerrarioMin().doubleValue()); // mínimo
        } else {
            resolverAlerta(terrario, "HUMIDADE_BAIXA");
        }

// Humidade alta
        if (leitura.getHumidade() > terrario.getHumidadeTerrarioMax()) {
            criarAlerta(
                    terrario,
                    "HUMIDADE_ALTA",
                    "Humidade acima do máximo.",
                    leitura.getHumidade().doubleValue(),
                    terrario.getHumidadeTerrarioMax().doubleValue()); // máximo
        } else {
            resolverAlerta(terrario, "HUMIDADE_ALTA");
        }
    }

    private void criarAlerta(Terrario terrario, String tipo, String mensagem, Double valor, Double limite) {

        var alertaExistente =
                alertaRepository.findByTerrarioIdTerrarioAndTipoAlertaAndResolvidoAlertaFalse(
                        terrario.getIdTerrario(), tipo);

        if (alertaExistente.isEmpty()) {

            Alerta alerta = new Alerta();
            alerta.setTerrario(terrario);
            alerta.setTipoAlerta(tipo);
            alerta.setValorAlerta(valor);
            alerta.setLimiteAlerta(limite);
            alerta.setMensagemAlerta(mensagem);
            alerta.setResolvidoAlerta(false);
            alerta.setCriadoEm(LocalDateTime.now());

            alertaRepository.save(alerta);
        }
    }

    private void resolverAlerta(Terrario terrario, String tipo) {

        alertaRepository
                .findByTerrarioIdTerrarioAndTipoAlertaAndResolvidoAlertaFalse(
                        terrario.getIdTerrario(), tipo)
                .ifPresent(alerta -> {
                    alerta.setResolvidoAlerta(true);
                    alertaRepository.save(alerta);
                });
    }
}