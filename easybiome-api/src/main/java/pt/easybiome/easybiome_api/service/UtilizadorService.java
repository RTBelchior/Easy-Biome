package pt.easybiome.easybiome_api.service;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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
}