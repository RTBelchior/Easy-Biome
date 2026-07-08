package pt.easybiome.easybiome_api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pt.easybiome.easybiome_api.model.LogComando;

public interface LogComandoRepository extends JpaRepository<LogComando, Long> {

    List<LogComando> findAllByOrderByExecutadoEmDesc();

    @Query("""
            SELECT l, d
            FROM LogComando l, Dispositivo d
            WHERE l.idDispositivo = d.idDispositivo
            AND d.idTerrario = :idTerrario
            ORDER BY l.executadoEm DESC
            """)
    List<Object[]> findByTerrario(@Param("idTerrario") Long idTerrario);

}