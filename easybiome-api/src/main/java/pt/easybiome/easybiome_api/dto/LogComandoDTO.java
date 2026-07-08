package pt.easybiome.easybiome_api.dto;

import java.time.LocalDateTime;

public class LogComandoDTO {

    private Long id;
    private Long idDispositivo;
    private String tipoDispositivo;
    private Long idUtilizador;
    private Boolean estadoAnterior;
    private Boolean estadoNovo;
    private String origemLog;
    private String acao;
    private String descricao;
    private LocalDateTime executadoEm;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdDispositivo() {
        return idDispositivo;
    }

    public void setIdDispositivo(Long idDispositivo) {
        this.idDispositivo = idDispositivo;
    }

    public String getTipoDispositivo() {
        return tipoDispositivo;
    }

    public void setTipoDispositivo(String tipoDispositivo) {
        this.tipoDispositivo = tipoDispositivo;
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