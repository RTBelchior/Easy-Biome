package pt.easybiome.easybiome_api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerta")
public class Alerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alerta")
    private Long idAlerta;

    @ManyToOne
    @JoinColumn(name = "id_terrario", nullable = false)
    private Terrario terrario;

    @Column(name = "tipo_alerta", nullable = false)
    private String tipoAlerta;

    @Column(name = "mensagem_alerta", nullable = false)
    private String mensagemAlerta;

    @Column(name = "resolvido_alerta", nullable = false)
    private Boolean resolvidoAlerta;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "valor_alerta")
    private Double valorAlerta;

    @Column(name = "limite_alerta")
    private Double limiteAlerta;

    public Alerta() {
    }

    public Long getIdAlerta() {
        return idAlerta;
    }

    public void setIdAlerta(Long idAlerta) {
        this.idAlerta = idAlerta;
    }

    public Terrario getTerrario() {
        return terrario;
    }

    public void setTerrario(Terrario terrario) {
        this.terrario = terrario;
    }

    public String getTipoAlerta() {
        return tipoAlerta;
    }

    public void setTipoAlerta(String tipoAlerta) {
        this.tipoAlerta = tipoAlerta;
    }

    public String getMensagemAlerta() {
        return mensagemAlerta;
    }

    public void setMensagemAlerta(String mensagemAlerta) {
        this.mensagemAlerta = mensagemAlerta;
    }

    public Boolean getResolvidoAlerta() {
        return resolvidoAlerta;
    }

    public void setResolvidoAlerta(Boolean resolvidoAlerta) {
        this.resolvidoAlerta = resolvidoAlerta;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Double getValorAlerta() {
        return valorAlerta;
    }

    public void setValorAlerta(Double valorAlerta) {
        this.valorAlerta = valorAlerta;
    }

    public Double getLimiteAlerta() {
        return limiteAlerta;
    }

    public void setLimiteAlerta(Double limiteAlerta) {
        this.limiteAlerta = limiteAlerta;
    }
}