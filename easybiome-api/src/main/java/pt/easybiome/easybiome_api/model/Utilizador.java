package pt.easybiome.easybiome_api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilizador")
public class Utilizador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_utilizador")
    private Long idUtilizador;

    @Column(name = "nome_utilizador")
    private String nomeUtilizador;

    @Column(name = "email_utilizador")
    private String emailUtilizador;

    @Column(name = "password_hash_utilizador")
    private String passwordHashUtilizador;

    @Column(name = "tipo_utilizador")
    private String tipoUtilizador;

    @Column(name = "ativo_utilizador")
    private Boolean ativoUtilizador;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    public Utilizador() {}

    public Long getIdUtilizador() {
        return idUtilizador;
    }

    public void setIdUtilizador(Long idUtilizador) {
        this.idUtilizador = idUtilizador;
    }

    public String getNomeUtilizador() {
        return nomeUtilizador;
    }

    public void setNomeUtilizador(String nomeUtilizador) {
        this.nomeUtilizador = nomeUtilizador;
    }

    public String getEmailUtilizador() {
        return emailUtilizador;
    }

    public void setEmailUtilizador(String emailUtilizador) {
        this.emailUtilizador = emailUtilizador;
    }

    public String getPasswordHashUtilizador() {
        return passwordHashUtilizador;
    }

    public void setPasswordHashUtilizador(String passwordHashUtilizador) {
        this.passwordHashUtilizador = passwordHashUtilizador;
    }

    public String getTipoUtilizador() {
        return tipoUtilizador;
    }

    public void setTipoUtilizador(String tipoUtilizador) {
        this.tipoUtilizador = tipoUtilizador;
    }

    public Boolean getAtivoUtilizador() {
        return ativoUtilizador;
    }

    public void setAtivoUtilizador(Boolean ativoUtilizador) {
        this.ativoUtilizador = ativoUtilizador;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}