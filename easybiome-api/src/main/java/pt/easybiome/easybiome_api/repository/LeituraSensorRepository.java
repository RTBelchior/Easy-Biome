package pt.easybiome.easybiome_api.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pt.easybiome.easybiome_api.model.LeituraSensor;
import java.time.LocalDateTime;

public interface LeituraSensorRepository extends JpaRepository<LeituraSensor, Long> {

    LeituraSensor findTopByIdTerrarioOrderByRegistadoEmDesc(Long idTerrario);

    List<LeituraSensor> findByIdTerrarioAndRegistadoEmAfterOrderByRegistadoEmAsc(
            Long idTerrario,
            LocalDateTime data
    );

}