package pt.easybiome.easybiome_api.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "terrario")
public class Terrario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_terrario")
    private Long idTerrario;

    @Column(name = "nome_terrario")
    private String nomeTerrario;

    @Column(name = "descricao_terrario")
    private String descricaoTerrario;

    @Column(name = "imagem_terrario")
    private String imagemTerrario;

    @Column(name = "temp_terrario_min")
    private Float tempTerrarioMin;

    @Column(name = "temp_terrario_max")
    private Float tempTerrarioMax;

    @Column(name = "humidade_terrario_min")
    private Float humidadeTerrarioMin;

    @Column(name = "humidade_terrario_max")
    private Float humidadeTerrarioMax;

    @Column(name = "hora_ligar_iluminacao")
    private LocalTime horaLigarIluminacao;

    @Column(name = "hora_desligar_iluminacao")
    private LocalTime horaDesligarIluminacao;

    public Terrario() {
    }

    public Long getIdTerrario() {
        return idTerrario;
    }

    public void setIdTerrario(Long idTerrario) {
        this.idTerrario = idTerrario;
    }

    public String getNomeTerrario() {
        return nomeTerrario;
    }

    public void setNomeTerrario(String nomeTerrario) {
        this.nomeTerrario = nomeTerrario;
    }

    public String getDescricaoTerrario() {
        return descricaoTerrario;
    }

    public void setDescricaoTerrario(String descricaoTerrario) {
        this.descricaoTerrario = descricaoTerrario;
    }

    public String getImagemTerrario() {
        return imagemTerrario;
    }

    public void setImagemTerrario(String imagemTerrario) {
        this.imagemTerrario = imagemTerrario;
    }

    public Float getTempTerrarioMin() {
        return tempTerrarioMin;
    }

    public void setTempTerrarioMin(Float tempTerrarioMin) {
        this.tempTerrarioMin = tempTerrarioMin;
    }

    public Float getTempTerrarioMax() {
        return tempTerrarioMax;
    }

    public void setTempTerrarioMax(Float tempTerrarioMax) {
        this.tempTerrarioMax = tempTerrarioMax;
    }

    public Float getHumidadeTerrarioMin() {
        return humidadeTerrarioMin;
    }

    public void setHumidadeTerrarioMin(Float humidadeTerrarioMin) {
        this.humidadeTerrarioMin = humidadeTerrarioMin;
    }

    public Float getHumidadeTerrarioMax() {
        return humidadeTerrarioMax;
    }

    public void setHumidadeTerrarioMax(Float humidadeTerrarioMax) {
        this.humidadeTerrarioMax = humidadeTerrarioMax;
    }

    public LocalTime getHoraLigarIluminacao() {
        return horaLigarIluminacao;
    }

    public void setHoraLigarIluminacao(LocalTime horaLigarIluminacao) {
        this.horaLigarIluminacao = horaLigarIluminacao;
    }

    public LocalTime getHoraDesligarIluminacao() {
        return horaDesligarIluminacao;
    }

    public void setHoraDesligarIluminacao(LocalTime horaDesligarIluminacao) {
        this.horaDesligarIluminacao = horaDesligarIluminacao;
    }
}