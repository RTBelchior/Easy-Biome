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

    public Long getIdTerrario() {
        return idTerrario;
    }

    public Float getTempTerrarioMin() {
        return tempTerrarioMin;
    }

    public Float getTempTerrarioMax() {
        return tempTerrarioMax;
    }

    public Float getHumidadeTerrarioMin() {
        return humidadeTerrarioMin;
    }

    public Float getHumidadeTerrarioMax() {
        return humidadeTerrarioMax;
    }

    public LocalTime getHoraLigarIluminacao() {
        return horaLigarIluminacao;
    }

    public LocalTime getHoraDesligarIluminacao() {
        return horaDesligarIluminacao;
    }
}