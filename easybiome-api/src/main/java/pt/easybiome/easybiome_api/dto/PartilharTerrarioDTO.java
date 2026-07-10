package pt.easybiome.easybiome_api.dto;

public class PartilharTerrarioDTO {

    private String email;
    private String permissao;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPermissao() {
        return permissao;
    }

    public void setPermissao(String permissao) {
        this.permissao = permissao;
    }
}