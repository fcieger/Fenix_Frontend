package br.com.fenix.nfe.api.service;

import br.com.fenix.nfe.api.dto.request.LoginRequest;
import br.com.fenix.nfe.api.dto.response.JwtResponse;

/**
 * Interface do serviço de autenticação
 * 
 * @author Fenix Team
 * @version 1.0
 */
public interface AuthService {

    /**
     * Realiza autenticação do usuário
     * 
     * @param loginRequest Dados de login
     * @return Resposta com token JWT
     */
    JwtResponse authenticate(LoginRequest loginRequest);

    /**
     * Renova token de acesso
     * 
     * @param refreshToken Token de renovação
     * @return Nova resposta com tokens
     */
    JwtResponse refreshToken(String refreshToken);

    /**
     * Valida se o token é válido
     * 
     * @param token Token a ser validado
     * @return true se válido, false caso contrário
     */
    boolean validateToken(String token);

    /**
     * Invalida token (logout)
     * 
     * @param token Token a ser invalidado
     */
    void invalidateToken(String token);
}
