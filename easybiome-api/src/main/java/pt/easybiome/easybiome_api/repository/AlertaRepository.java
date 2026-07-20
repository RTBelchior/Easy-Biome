package pt.easybiome.easybiome_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pt.easybiome.easybiome_api.model.Alerta;

import java.util.List;
import java.util.Optional;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {

    List<Alerta> findByTerrarioIdTerrarioOrderByCriadoEmDesc(Long idTerrario);

    Optional<Alerta> findByTerrarioIdTerrarioAndTipoAlertaAndResolvidoAlertaFalse(
            Long idTerrario,
            String tipoAlerta);
}