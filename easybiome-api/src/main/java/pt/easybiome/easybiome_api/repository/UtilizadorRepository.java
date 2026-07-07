package pt.easybiome.easybiome_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import pt.easybiome.easybiome_api.model.Utilizador;

public interface UtilizadorRepository extends JpaRepository<Utilizador, Long> {

    Optional<Utilizador> findByEmailUtilizador(String email);

    boolean existsByEmailUtilizador(String email);

}