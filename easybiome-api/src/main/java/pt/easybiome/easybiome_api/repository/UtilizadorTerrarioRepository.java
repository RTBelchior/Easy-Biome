package pt.easybiome.easybiome_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.easybiome.easybiome_api.model.UtilizadorTerrario;

import java.util.List;

@Repository
public interface UtilizadorTerrarioRepository extends JpaRepository<UtilizadorTerrario, Long> {

    List<UtilizadorTerrario> findByUtilizador_IdUtilizador(Long idUtilizador);

}