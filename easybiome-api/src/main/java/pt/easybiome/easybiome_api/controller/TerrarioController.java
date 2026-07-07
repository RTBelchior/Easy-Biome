package pt.easybiome.easybiome_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import pt.easybiome.easybiome_api.model.Terrario;
import pt.easybiome.easybiome_api.service.TerrarioService;

@RestController
@RequestMapping("/terrarios")
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
            @RequestParam(required = false) MultipartFile imagem

    ) {

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
                idUtilizador
        );
    }

    @GetMapping("/utilizador/{idUtilizador}")
    public List<Terrario> listarTerrarios(@PathVariable Long idUtilizador) {

        return terrarioService.listarTerrarios(idUtilizador);
    }
}