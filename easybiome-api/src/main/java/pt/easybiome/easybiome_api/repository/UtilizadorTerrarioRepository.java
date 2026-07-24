package pt.easybiome.easybiome_api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pt.easybiome.easybiome_api.model.UtilizadorTerrario;
import java.util.Optional;

@Repository
public interface UtilizadorTerrarioRepository
        extends JpaRepository<UtilizadorTerrario, Long> {

    // Todos os terrários aos quais um utilizador tem acesso
    List<UtilizadorTerrario> findByUtilizadorIdUtilizador(
            Long idUtilizador
    );

    // Todos os utilizadores que têm acesso a um terrário
    List<UtilizadorTerrario> findByTerrarioIdTerrario(
            Long idTerrario
    );

    // Verifica se um utilizador já tem acesso a um terrário
    boolean existsByUtilizadorIdUtilizadorAndTerrarioIdTerrario(
            Long idUtilizador,
            Long idTerrario
    );

    Optional<UtilizadorTerrario>
    findByUtilizadorIdUtilizadorAndTerrarioIdTerrario(
            Long idUtilizador,
            Long idTerrario
    );
}