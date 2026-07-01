package pt.easybiome.easybiome_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pt.easybiome.easybiome_api.model.LogComando;

public interface LogComandoRepository extends JpaRepository<LogComando, Long> {

}