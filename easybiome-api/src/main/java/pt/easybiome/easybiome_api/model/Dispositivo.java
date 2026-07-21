package pt.easybiome.easybiome_api.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import jakarta.persistence.Transient;

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

    @Column(name = "modo_manual")
    private Boolean modoManual;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @Transient
    private Long idUtilizador;

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

    public Boolean getModoManual() {
        return modoManual;
    }

    public void setModoManual(Boolean modoManual) {
        this.modoManual = modoManual;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    public Long getIdUtilizador() {
        return idUtilizador;
    }

    public void setIdUtilizador(Long idUtilizador) {
        this.idUtilizador = idUtilizador;
    }
}