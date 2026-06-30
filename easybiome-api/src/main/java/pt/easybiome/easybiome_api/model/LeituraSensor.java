package pt.easybiome.easybiome_api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leitura_sensor")
public class LeituraSensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLeituraSensor;

    private Long idTerrario;

    private Float temperatura;

    private Float humidade;

    private LocalDateTime registadoEm = LocalDateTime.now();

    // GETTERS

    public Long getIdLeituraSensor() {
        return idLeituraSensor;
    }

    public Long getIdTerrario() {
        return idTerrario;
    }

    public Float getTemperatura() {
        return temperatura;
    }

    public Float getHumidade() {
        return humidade;
    }

    public LocalDateTime getRegistadoEm() {
        return registadoEm;
    }

    // SETTERS

    public void setIdLeituraSensor(Long idLeituraSensor) {
        this.idLeituraSensor = idLeituraSensor;
    }

    public void setIdTerrario(Long idTerrario) {
        this.idTerrario = idTerrario;
    }

    public void setTemperatura(Float temperatura) {
        this.temperatura = temperatura;
    }

    public void setHumidade(Float humidade) {
        this.humidade = humidade;
    }

    public void setRegistadoEm(LocalDateTime registadoEm) {
        this.registadoEm = registadoEm;
    }
}