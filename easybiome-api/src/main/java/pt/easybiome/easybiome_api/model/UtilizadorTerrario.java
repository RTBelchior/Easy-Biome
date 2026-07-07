package pt.easybiome.easybiome_api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "utilizador_terrario")
public class UtilizadorTerrario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_utilizador_terrario")
    private Long idUtilizadorTerrario;

    @ManyToOne
    @JoinColumn(name = "id_utilizador")
    private Utilizador utilizador;

    @ManyToOne
    @JoinColumn(name = "id_terrario")
    private Terrario terrario;

    @Column(name = "permissao_terrario")
    private String permissaoTerrario;

    public UtilizadorTerrario() {
    }

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