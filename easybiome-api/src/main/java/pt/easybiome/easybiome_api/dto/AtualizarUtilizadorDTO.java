package pt.easybiome.easybiome_api.dto;

public class AtualizarUtilizadorDTO {

    private String nomeUtilizador;
    private String emailUtilizador;
    private String password;


    public AtualizarUtilizadorDTO() {
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}