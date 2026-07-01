package pt.easybiome.easybiome_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import pt.easybiome.easybiome_api.model.Dispositivo;

public interface DispositivoRepository extends JpaRepository<Dispositivo, Long> {

    List<Dispositivo> findByIdTerrario(Long idTerrario);

    Optional<Dispositivo> findByIdTerrarioAndTipoDispositivo(Long idTerrario, String tipoDispositivo);

}