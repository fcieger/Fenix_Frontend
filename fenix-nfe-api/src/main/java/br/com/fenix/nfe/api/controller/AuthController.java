package br.com.fenix.nfe.api.controller;

import br.com.fenix.nfe.api.dto.request.LoginRequest;
import br.com.fenix.nfe.api.dto.request.RefreshTokenRequest;
import br.com.fenix.nfe.api.dto.response.JwtResponse;
import br.com.fenix.nfe.api.dto.response.NFeResponse;
import br.com.fenix.nfe.api.security.JwtTokenProvider;
import br.com.fenix.nfe.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Controller de autenticação
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints de autenticação e autorização")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuthService authService;

    /**
     * Realiza login na API
     */
    @PostMapping("/login")
    @Operation(summary = "Realizar login", description = "Autentica usuário e retorna token JWT")
    public ResponseEntity<NFeResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            log.info("Tentativa de login para usuário: {}", loginRequest.getUsername());
            
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

            JwtResponse jwtResponse = JwtResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(tokenProvider.getRemainingTime(accessToken))
                    .username(authentication.getName())
                    .authorities(authorities)
                    .build();

            log.info("Login realizado com sucesso para usuário: {}", loginRequest.getUsername());
            
            return ResponseEntity.ok(NFeResponse.<JwtResponse>builder()
                    .success(true)
                    .message("Login realizado com sucesso")
                    .data(jwtResponse)
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("Erro no login para usuário: {} - {}", loginRequest.getUsername(), e.getMessage());
            
            return ResponseEntity.badRequest()
                    .body(NFeResponse.<JwtResponse>builder()
                            .success(false)
                            .message("Credenciais inválidas")
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    /**
     * Renova token de acesso usando refresh token
     */
    @PostMapping("/refresh")
    @Operation(summary = "Renovar token", description = "Renova token de acesso usando refresh token")
    public ResponseEntity<NFeResponse<JwtResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshRequest) {
        try {
            log.info("Tentativa de renovação de token");
            
            if (!tokenProvider.validateToken(refreshRequest.getRefreshToken())) {
                return ResponseEntity.badRequest()
                        .body(NFeResponse.<JwtResponse>builder()
                                .success(false)
                                .message("Refresh token inválido")
                                .timestamp(LocalDateTime.now())
                                .build());
            }

            String username = tokenProvider.getUsernameFromToken(refreshRequest.getRefreshToken());
            String authorities = tokenProvider.getAuthoritiesFromToken(refreshRequest.getRefreshToken());
            
            // Criar nova autenticação
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    username, null, 
                    authorities != null ? 
                        Arrays.stream(authorities.split(","))
                                .map(String::trim)
                                .map(auth -> (GrantedAuthority) () -> auth)
                                .collect(Collectors.toList()) : 
                        List.of()
            );

            String newAccessToken = tokenProvider.generateToken(authentication);
            String newRefreshToken = tokenProvider.generateRefreshToken(authentication);

            JwtResponse jwtResponse = JwtResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn(tokenProvider.getRemainingTime(newAccessToken))
                    .username(username)
                    .authorities(authorities)
                    .build();

            log.info("Token renovado com sucesso para usuário: {}", username);
            
            return ResponseEntity.ok(NFeResponse.<JwtResponse>builder()
                    .success(true)
                    .message("Token renovado com sucesso")
                    .data(jwtResponse)
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("Erro na renovação de token: {}", e.getMessage());
            
            return ResponseEntity.badRequest()
                    .body(NFeResponse.<JwtResponse>builder()
                            .success(false)
                            .message("Erro ao renovar token")
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    /**
     * Realiza logout (invalida token)
     */
    @PostMapping("/logout")
    @Operation(summary = "Realizar logout", description = "Invalida token de acesso")
    public ResponseEntity<NFeResponse<Void>> logout(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7); // Remove "Bearer "
            
            // Aqui você pode implementar blacklist de tokens se necessário
            log.info("Logout realizado para token: {}", jwt.substring(0, Math.min(20, jwt.length())) + "...");
            
            return ResponseEntity.ok(NFeResponse.<Void>builder()
                    .success(true)
                    .message("Logout realizado com sucesso")
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("Erro no logout: {}", e.getMessage());
            
            return ResponseEntity.badRequest()
                    .body(NFeResponse.<Void>builder()
                            .success(false)
                            .message("Erro ao realizar logout")
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    /**
     * Valida token atual
     */
    @GetMapping("/validate")
    @Operation(summary = "Validar token", description = "Valida se o token atual é válido")
    public ResponseEntity<NFeResponse<Boolean>> validateToken(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7); // Remove "Bearer "
            boolean isValid = tokenProvider.validateToken(jwt);
            
            return ResponseEntity.ok(NFeResponse.<Boolean>builder()
                    .success(true)
                    .message(isValid ? "Token válido" : "Token inválido")
                    .data(isValid)
                    .timestamp(LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            log.error("Erro na validação de token: {}", e.getMessage());
            
            return ResponseEntity.badRequest()
                    .body(NFeResponse.<Boolean>builder()
                            .success(false)
                            .message("Erro ao validar token")
                            .data(false)
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }
}
