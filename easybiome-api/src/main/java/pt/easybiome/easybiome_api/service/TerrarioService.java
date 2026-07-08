package pt.easybiome.easybiome_api.service;

import java.time.LocalTime;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import pt.easybiome.easybiome_api.model.Terrario;
import pt.easybiome.easybiome_api.model.Utilizador;
import pt.easybiome.easybiome_api.model.UtilizadorTerrario;
import pt.easybiome.easybiome_api.repository.TerrarioRepository;
import pt.easybiome.easybiome_api.repository.UtilizadorRepository;
import pt.easybiome.easybiome_api.repository.UtilizadorTerrarioRepository;

@Service
public class TerrarioService {

    @Autowired
    private TerrarioRepository terrarioRepository;

    @Autowired
    private UtilizadorRepository utilizadorRepository;

    @Autowired
    private UtilizadorTerrarioRepository utilizadorTerrarioRepository;

    public Terrario criarTerrario(
            String nome,
            String descricao,
            Float tempMin,
            Float tempMax,
            Float humMin,
            Float humMax,
            String horaLigar,
            String horaDesligar,
            MultipartFile imagem,
            String imagemPredefinida,
            Long idUtilizador) {

        Utilizador utilizador = utilizadorRepository.findById(idUtilizador)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));

        Terrario terrario = new Terrario();

        terrario.setNomeTerrario(nome);
        terrario.setDescricaoTerrario(descricao);

        terrario.setTempTerrarioMin(tempMin);
        terrario.setTempTerrarioMax(tempMax);

        terrario.setHumidadeTerrarioMin(humMin);
        terrario.setHumidadeTerrarioMax(humMax);

        terrario.setHoraLigarIluminacao(LocalTime.parse(horaLigar));
        terrario.setHoraDesligarIluminacao(LocalTime.parse(horaDesligar));

        // Imagem
        if (imagem != null && !imagem.isEmpty()) {

            try {

                Path pasta = Paths.get("uploads");

                if (!Files.exists(pasta)) {
                    Files.createDirectories(pasta);
                }

                String nomeImagem =
                        UUID.randomUUID() + "_" + imagem.getOriginalFilename();

                Path destino = pasta.resolve(nomeImagem);

                Files.copy(
                        imagem.getInputStream(),
                        destino,
                        StandardCopyOption.REPLACE_EXISTING
                );

                terrario.setImagemTerrario("uploads/" + nomeImagem);

            } catch (IOException e) {
                throw new RuntimeException("Erro ao guardar imagem", e);
            }

        } else if (imagemPredefinida != null && !imagemPredefinida.isBlank()) {

            terrario.setImagemTerrario("imagens/terrarios/" + imagemPredefinida);

        } else {

            terrario.setImagemTerrario("imagens/terrario-default.jpg");

        }

        terrario = terrarioRepository.save(terrario);

        UtilizadorTerrario ut = new UtilizadorTerrario();
        ut.setUtilizador(utilizador);
        ut.setTerrario(terrario);
        ut.setPermissaoTerrario("DONO");

        utilizadorTerrarioRepository.save(ut);

        return terrario;
    }

    public List<Terrario> listarTerrarios(Long idUtilizador) {

        return utilizadorTerrarioRepository
                .findByUtilizador_IdUtilizador(idUtilizador)
                .stream()
                .map(UtilizadorTerrario::getTerrario)
                .collect(Collectors.toList());
    }
}