package pt.easybiome.easybiome_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import pt.easybiome.easybiome_api.dto.AtualizarTerrarioDTO;
import pt.easybiome.easybiome_api.dto.PartilharTerrarioDTO;
import pt.easybiome.easybiome_api.model.Terrario;
import pt.easybiome.easybiome_api.service.TerrarioService;

@RestController
@RequestMapping("api/terrarios")
@CrossOrigin(origins = "*")
public class TerrarioController {

    @Autowired
    private TerrarioService terrarioService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Terrario criarTerrario(
            @RequestParam String nome,
            @RequestParam(required = false) String descricao,
            @RequestParam Float tempMin,
            @RequestParam Float tempMax,
            @RequestParam Float humMin,
            @RequestParam Float humMax,
            @RequestParam String horaLigar,
            @RequestParam String horaDesligar,
            @RequestParam Long idUtilizador,
            @RequestParam(required = false) MultipartFile imagem,
            @RequestParam(required = false) String imagemPredefinida) {

        return terrarioService.criarTerrario(
                nome,
                descricao,
                tempMin,
                tempMax,
                humMin,
                humMax,
                horaLigar,
                horaDesligar,
                imagem,
                imagemPredefinida,
                idUtilizador);
    }

    @GetMapping("/utilizador/{idUtilizador}")
    public List<Terrario> listarTerrarios(@PathVariable Long idUtilizador) {
        return terrarioService.listarTerrarios(idUtilizador);
    }

    @GetMapping("/{id}")
    public Terrario obterTerrario(@PathVariable Long id) {
        return terrarioService.obterTerrario(id);
    }

    @PutMapping("/{id}")
    public Terrario atualizarTerrario(
            @PathVariable Long id,
            @RequestBody AtualizarTerrarioDTO dto) {

        return terrarioService.atualizarTerrario(id, dto);
    }

    @DeleteMapping("/{id}")
    public void apagarTerrario(@PathVariable Long id) {
        terrarioService.apagarTerrario(id);
    }

    @PostMapping("/{id}/partilhar")
    public ResponseEntity<?> partilharTerrario(
            @PathVariable Long id,
            @RequestBody PartilharTerrarioDTO dto) {

        try {

            terrarioService.partilharTerrario(
                    id,
                    dto.getEmail()
            );

            return ResponseEntity.ok(
                    "Terrário partilhado com sucesso."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(400)
                    .body(e.getMessage());

        }
    }

    @GetMapping("/{idTerrario}/utilizadores")
    public ResponseEntity<?> listarUtilizadoresComAcesso(
            @PathVariable Long idTerrario) {

        try {

            return ResponseEntity.ok(
                    terrarioService
                            .listarUtilizadoresComAcesso(idTerrario)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        }
    }

    @DeleteMapping("/{idTerrario}/utilizadores/{idUtilizador}")
    public ResponseEntity<?> removerAcessoTerrario(
            @PathVariable Long idTerrario,
            @PathVariable Long idUtilizador) {

        try {

            terrarioService.removerAcessoTerrario(
                    idTerrario,
                    idUtilizador
            );

            return ResponseEntity.ok(
                    "Acesso removido com sucesso."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        }
    }
}