package pt.easybiome.easybiome_api.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import pt.easybiome.easybiome_api.dto.AtualizarUtilizadorDTO;
import pt.easybiome.easybiome_api.dto.LoginDTO;
import pt.easybiome.easybiome_api.dto.RegistoDTO;
import pt.easybiome.easybiome_api.model.Utilizador;
import pt.easybiome.easybiome_api.repository.UtilizadorRepository;

@Service
public class UtilizadorService {

    private final UtilizadorRepository repository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UtilizadorService(UtilizadorRepository repository) {
        this.repository = repository;
    }

    public Utilizador registar(RegistoDTO dto) {

        if (repository.existsByEmailUtilizador(dto.getEmail())) {
            throw new RuntimeException("Já existe uma conta com este email.");
        }

        Utilizador utilizador = new Utilizador();

        utilizador.setNomeUtilizador(dto.getNome().trim());
        utilizador.setEmailUtilizador(dto.getEmail().trim());

        utilizador.setPasswordHashUtilizador(
                encoder.encode(dto.getPassword()));

        utilizador.setTipoUtilizador("UTILIZADOR");
        utilizador.setAtivoUtilizador(true);

        // Data de criação da conta
        utilizador.setCriadoEm(LocalDateTime.now());

        return repository.save(utilizador);
    }

    public Utilizador login(LoginDTO dto) {

        Optional<Utilizador> op =
                repository.findByEmailUtilizador(dto.getEmail().trim());

        if (op.isEmpty()) {
            throw new RuntimeException("Email ou palavra-passe incorretos.");
        }

        Utilizador utilizador = op.get();

        if (!utilizador.getAtivoUtilizador()) {
            throw new RuntimeException("Conta desativada.");
        }

        boolean correta = encoder.matches(
                dto.getPassword(),
                utilizador.getPasswordHashUtilizador());

        if (!correta) {
            throw new RuntimeException("Email ou palavra-passe incorretos.");
        }

        return utilizador;
    }

    public Utilizador atualizar(Long id, AtualizarUtilizadorDTO dto) {

        Utilizador u = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));

        if (dto.getNomeUtilizador() != null && !dto.getNomeUtilizador().isBlank()) {
            u.setNomeUtilizador(dto.getNomeUtilizador());
        }

        if (dto.getEmailUtilizador() != null && !dto.getEmailUtilizador().isBlank()) {
            u.setEmailUtilizador(dto.getEmailUtilizador());
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            u.setPasswordHashUtilizador(
                    encoder.encode(dto.getPassword())
            );
        }

        return repository.save(u);
    }
}