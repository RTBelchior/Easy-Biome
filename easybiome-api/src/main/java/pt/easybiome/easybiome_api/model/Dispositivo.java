package pt.easybiome.easybiome_api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispositivo")
public class Dispositivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dispositivo")
    private Long idDispositivo;

    @Column(name = "id_terrario")
    private Long idTerrario;

    @Column(name = "nome_dispositivo")
    private String nomeDispositivo;

    @Column(name = "tipo_dispositivo")
    private String tipoDispositivo;

    @Column(name = "estado_atual")
    private Boolean estadoAtual;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    public Dispositivo() {
    }

    public Long getIdDispositivo() {
        return idDispositivo;
    }

    public void setIdDispositivo(Long idDispositivo) {
        this.idDispositivo = idDispositivo;
    }

    public Long getIdTerrario() {
        return idTerrario;
    }

    public void setIdTerrario(Long idTerrario) {
        this.idTerrario = idTerrario;
    }

    public String getNomeDispositivo() {
        return nomeDispositivo;
    }

    public void setNomeDispositivo(String nomeDispositivo) {
        this.nomeDispositivo = nomeDispositivo;
    }

    public String getTipoDispositivo() {
        return tipoDispositivo;
    }

    public void setTipoDispositivo(String tipoDispositivo) {
        this.tipoDispositivo = tipoDispositivo;
    }

    public Boolean getEstadoAtual() {
        return estadoAtual;
    }

    public void setEstadoAtual(Boolean estadoAtual) {
        this.estadoAtual = estadoAtual;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}