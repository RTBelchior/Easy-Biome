package pt.easybiome.easybiome_api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "utilizador_terrario")
public class UtilizadorTerrario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUtilizadorTerrario;

    @ManyToOne
    @JoinColumn(name = "idUtilizador", nullable = false)
    private Utilizador utilizador;

    @ManyToOne
    @JoinColumn(name = "idTerrario", nullable = false)
    private Terrario terrario;

    @Column(name = "permissaoTerrario", nullable = false)
    private String permissaoTerrario;

    public Long getIdUtilizadorTerrario() {
        return idUtilizadorTerrario;
    }

    public void setIdUtilizadorTerrario(Long idUtilizadorTerrario) {
        this.idUtilizadorTerrario = idUtilizadorTerrario;
    }

    public Utilizador getUtilizador() {
        return utilizador;
    }

    public void setUtilizador(Utilizador utilizador) {
        this.utilizador = utilizador;
    }

    public Terrario getTerrario() {
        return terrario;
    }

    public void setTerrario(Terrario terrario) {
        this.terrario = terrario;
    }

    public String getPermissaoTerrario() {
        return permissaoTerrario;
    }

    public void setPermissaoTerrario(String permissaoTerrario) {
        this.permissaoTerrario = permissaoTerrario;
    }
}