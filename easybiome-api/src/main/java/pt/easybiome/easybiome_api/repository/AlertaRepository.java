package pt.easybiome.easybiome_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pt.easybiome.easybiome_api.model.Alerta;

import java.util.List;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {

    List<Alerta> findByTerrarioIdTerrarioOrderByCriadoEmDesc(Long idTerrario);

}