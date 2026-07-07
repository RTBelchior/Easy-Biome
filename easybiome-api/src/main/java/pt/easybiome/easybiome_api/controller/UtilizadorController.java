package pt.easybiome.easybiome_api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pt.easybiome.easybiome_api.dto.LoginDTO;
import pt.easybiome.easybiome_api.dto.RegistoDTO;
import pt.easybiome.easybiome_api.model.Utilizador;
import pt.easybiome.easybiome_api.service.UtilizadorService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UtilizadorController {

    private final UtilizadorService service;

    public UtilizadorController(UtilizadorService service) {
        this.service = service;
    }

    @PostMapping("/registar")
    public ResponseEntity<?> registar(@RequestBody RegistoDTO dto) {

        try {

            Utilizador utilizador = service.registar(dto);

            utilizador.setPasswordHashUtilizador(null);

            return ResponseEntity.ok(utilizador);

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(e.getMessage());

        }

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dto) {

        try {

            Utilizador utilizador = service.login(dto);

            utilizador.setPasswordHashUtilizador(null);

            return ResponseEntity.ok(utilizador);

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(e.getMessage());

        }

    }

}