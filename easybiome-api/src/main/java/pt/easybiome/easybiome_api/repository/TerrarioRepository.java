package pt.easybiome.easybiome_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pt.easybiome.easybiome_api.model.Terrario;

public interface TerrarioRepository extends JpaRepository<Terrario, Long> {

}