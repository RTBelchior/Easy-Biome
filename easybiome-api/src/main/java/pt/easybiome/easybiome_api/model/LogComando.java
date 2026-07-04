package pt.easybiome.easybiome_api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "log_comando")
public class LogComando {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_log")
    private Long id;

    @Column(name = "id_dispositivo")
    private Long idDispositivo;

    @Column(name = "id_utilizador")
    private Long idUtilizador;

    @Column(name = "estado_anterior")
    private Boolean estadoAnterior;

    @Column(name = "estado_novo")
    private Boolean estadoNovo;

    @Column(name = "origem_log")
    private String origemLog;

    @Column(name = "acao")
    private String acao;

    @Column(name = "descricao")
    private String descricao;

    @Column(name = "executado_em")
    private LocalDateTime executadoEm;

    public LogComando() {
    }

    public Long getId() {
        return id;
    }

    public Long getIdDispositivo() {
        return idDispositivo;
    }

    public void setIdDispositivo(Long idDispositivo) {
        this.idDispositivo = idDispositivo;
    }

    public Long getIdUtilizador() {
        return idUtilizador;
    }

    public void setIdUtilizador(Long idUtilizador) {
        this.idUtilizador = idUtilizador;
    }

    public Boolean getEstadoAnterior() {
        return estadoAnterior;
    }

    public void setEstadoAnterior(Boolean estadoAnterior) {
        this.estadoAnterior = estadoAnterior;
    }

    public Boolean getEstadoNovo() {
        return estadoNovo;
    }

    public void setEstadoNovo(Boolean estadoNovo) {
        this.estadoNovo = estadoNovo;
    }

    public String getOrigemLog() {
        return origemLog;
    }

    public void setOrigemLog(String origemLog) {
        this.origemLog = origemLog;
    }

    public String getAcao() {
        return acao;
    }

    public void setAcao(String acao) {
        this.acao = acao;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDateTime getExecutadoEm() {
        return executadoEm;
    }

    public void setExecutadoEm(LocalDateTime executadoEm) {
        this.executadoEm = executadoEm;
    }
}