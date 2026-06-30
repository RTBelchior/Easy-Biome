package pt.easybiome.easybiome_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pt.easybiome.easybiome_api.model.LeituraSensor;

public interface LeituraSensorRepository extends JpaRepository<LeituraSensor, Long> {
    LeituraSensor findTopByIdTerrarioOrderByRegistadoEmDesc(Long idTerrario);

}