package br.com.fenix.nfe.api.service.impl;

import br.com.fenix.nfe.api.dto.request.LoginRequest;
import br.com.fenix.nfe.api.dto.response.JwtResponse;
import br.com.fenix.nfe.api.security.JwtTokenProvider;
import br.com.fenix.nfe.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Implementação do serviço de autenticação
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Override
    public JwtResponse authenticate(LoginRequest loginRequest) {
        try {
            log.info("Iniciando autenticação para usuário: {}", loginRequest.getUsername());
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            String accessToken = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(authentication);
            
            String authorities = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expiresAt = now.plusSeconds(tokenProvider.getRemainingTime(accessToken) / 1000);

            JwtResponse response = JwtResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(tokenProvider.getRemainingTime(accessToken))
                    .username(authentication.getName())
                    .authorities(authorities)
                    .issuedAt(now)
                    .expiresAt(expiresAt)
                    .build();

            log.info("Autenticação realizada com sucesso para usuário: {}", loginRequest.getUsername());
            return response;

        } catch (Exception e) {
            log.error("Erro na autenticação para usuário: {} - {}", 
                    loginRequest.getUsername(), e.getMessage());
            throw new RuntimeException("Credenciais inválidas", e);
        }
    }

    @Override
    public JwtResponse refreshToken(String refreshToken) {
        try {
            log.info("Iniciando renovação de token");
            
            if (!tokenProvider.validateToken(refreshToken)) {
                throw new RuntimeException("Refresh token inválido");
            }

            String username = tokenProvider.getUsernameFromToken(refreshToken);
            String authorities = tokenProvider.getAuthoritiesFromToken(refreshToken);
            
            // Criar nova autenticação
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    username, null, 
                    authorities != null ? 
                        authorities.split(",").length > 0 ? 
                            java.util.Arrays.stream(authorities.split(","))
                                    .map(String::trim)
                                    .map(auth -> (GrantedAuthority) () -> auth)
                                    .collect(Collectors.toList()) : 
                            java.util.List.of() : 
                        java.util.List.of()
            );

            String newAccessToken = tokenProvider.generateToken(authentication);
            String newRefreshToken = tokenProvider.generateRefreshToken(authentication);

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expiresAt = now.plusSeconds(tokenProvider.getRemainingTime(newAccessToken) / 1000);

            JwtResponse response = JwtResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn(tokenProvider.getRemainingTime(newAccessToken))
                    .username(username)
                    .authorities(authorities)
                    .issuedAt(now)
                    .expiresAt(expiresAt)
                    .build();

            log.info("Token renovado com sucesso para usuário: {}", username);
            return response;

        } catch (Exception e) {
            log.error("Erro na renovação de token: {}", e.getMessage());
            throw new RuntimeException("Erro ao renovar token", e);
        }
    }

    @Override
    public boolean validateToken(String token) {
        try {
            return tokenProvider.validateToken(token);
        } catch (Exception e) {
            log.error("Erro na validação de token: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void invalidateToken(String token) {
        try {
            // Aqui você pode implementar blacklist de tokens
            // Por exemplo, armazenando em Redis ou banco de dados
            log.info("Token invalidado: {}", token.substring(0, Math.min(20, token.length())) + "...");
        } catch (Exception e) {
            log.error("Erro ao invalidar token: {}", e.getMessage());
        }
    }
}
