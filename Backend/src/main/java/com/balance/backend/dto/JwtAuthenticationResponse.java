package com.balance.backend.dto;

public class JwtAuthenticationResponse {
    private String accessToken;
    private String name;
    private String email;

    public JwtAuthenticationResponse() {}

    public JwtAuthenticationResponse(String accessToken, String name, String email) {
        this.accessToken = accessToken;
        this.name = name;
        this.email = email;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
