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

import pt.easybiome.easybiome_api.dto.AtualizarTerrarioDTO;
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

    public Terrario obterTerrario(Long id) {

        return terrarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Terrário não encontrado"));
    }

    public Terrario atualizarTerrario(Long id, AtualizarTerrarioDTO dto) {

        Terrario terrario = terrarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Terrário não encontrado"));

        if (dto.getNome() != null) {
            terrario.setNomeTerrario(dto.getNome());
        }

        if (dto.getDescricao() != null) {
            terrario.setDescricaoTerrario(dto.getDescricao());
        }

        if (dto.getTempMin() != null) {
            terrario.setTempTerrarioMin(dto.getTempMin());
        }

        if (dto.getTempMax() != null) {
            terrario.setTempTerrarioMax(dto.getTempMax());
        }

        if (dto.getHumMin() != null) {
            terrario.setHumidadeTerrarioMin(dto.getHumMin());
        }

        if (dto.getHumMax() != null) {
            terrario.setHumidadeTerrarioMax(dto.getHumMax());
        }

        if (dto.getHoraLigar() != null) {
            terrario.setHoraLigarIluminacao(dto.getHoraLigar());
        }

        if (dto.getHoraDesligar() != null) {
            terrario.setHoraDesligarIluminacao(dto.getHoraDesligar());
        }

        return terrarioRepository.save(terrario);
    }

    public void apagarTerrario(Long id) {

        Terrario terrario = terrarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Terrário não encontrado"));

        utilizadorTerrarioRepository.deleteAll(
                utilizadorTerrarioRepository.findByTerrario_IdTerrario(id)
        );

        terrarioRepository.delete(terrario);
    }

    public void partilharTerrario(
            Long idTerrario,
            String email,
            String permissao) {

        Terrario terrario = terrarioRepository.findById(idTerrario)
                .orElseThrow(() ->
                        new RuntimeException("Terrário não encontrado"));

        Utilizador utilizador = utilizadorRepository
                .findByEmailUtilizador(email)
                .orElseThrow(() ->
                        new RuntimeException("Utilizador não encontrado"));

        boolean existe =
                utilizadorTerrarioRepository
                        .existsByUtilizador_IdUtilizadorAndTerrario_IdTerrario(
                                utilizador.getIdUtilizador(),
                                idTerrario);

        if (existe) {
            throw new RuntimeException("Este utilizador já tem acesso.");
        }

        UtilizadorTerrario ut = new UtilizadorTerrario();

        ut.setTerrario(terrario);
        ut.setUtilizador(utilizador);
        ut.setPermissaoTerrario(permissao);

        utilizadorTerrarioRepository.save(ut);
    }
}