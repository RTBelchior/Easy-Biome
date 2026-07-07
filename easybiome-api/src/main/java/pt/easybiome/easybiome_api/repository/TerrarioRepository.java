package pt.easybiome.easybiome_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.easybiome.easybiome_api.model.Terrario;

public interface TerrarioRepository extends JpaRepository<Terrario, Long> {

}