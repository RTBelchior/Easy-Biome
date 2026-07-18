package pt.easybiome.easybiome_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pt.easybiome.easybiome_api.model.Alerta;
import pt.easybiome.easybiome_api.repository.AlertaRepository;

import java.util.List;

@Service
public class AlertaService {

    @Autowired
    private AlertaRepository alertaRepository;

    public List<Alerta> listarPorTerrario(Long idTerrario) {
        return alertaRepository.findByTerrarioIdTerrarioOrderByCriadoEmDesc(idTerrario);
    }

}