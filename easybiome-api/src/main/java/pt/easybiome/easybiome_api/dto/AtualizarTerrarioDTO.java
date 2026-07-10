package pt.easybiome.easybiome_api.dto;

import java.time.LocalTime;

public class AtualizarTerrarioDTO {

    private String nome;
    private String descricao;

    private Float tempMin;
    private Float tempMax;

    private Float humMin;
    private Float humMax;

    private LocalTime horaLigar;
    private LocalTime horaDesligar;

    public AtualizarTerrarioDTO() {
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Float getTempMin() {
        return tempMin;
    }

    public void setTempMin(Float tempMin) {
        this.tempMin = tempMin;
    }

    public Float getTempMax() {
        return tempMax;
    }

    public void setTempMax(Float tempMax) {
        this.tempMax = tempMax;
    }

    public Float getHumMin() {
        return humMin;
    }

    public void setHumMin(Float humMin) {
        this.humMin = humMin;
    }

    public Float getHumMax() {
        return humMax;
    }

    public void setHumMax(Float humMax) {
        this.humMax = humMax;
    }

    public LocalTime getHoraLigar() {
        return horaLigar;
    }

    public void setHoraLigar(LocalTime horaLigar) {
        this.horaLigar = horaLigar;
    }

    public LocalTime getHoraDesligar() {
        return horaDesligar;
    }

    public void setHoraDesligar(LocalTime horaDesligar) {
        this.horaDesligar = horaDesligar;
    }
}