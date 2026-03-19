package com.example.area.controller;

import com.example.area.service.AuthService;
import com.example.area.v1.DTOs.login.LoginRequest;
import com.example.area.v1.DTOs.register.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            var user = authService.register(request);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request);
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/google-mobile")
    public ResponseEntity<?> googleMobileLogin(@RequestBody java.util.Map<String, String> request) {
        try {
            String accessToken = request.get("accessToken");
            if (accessToken == null || accessToken.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "accessToken is required"));
            }

            String token = authService.loginWithGoogleToken(accessToken);
            return ResponseEntity.ok(java.util.Map.of("token", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/github-mobile")
    public ResponseEntity<?> githubMobileConnect(
            @RequestBody java.util.Map<String, String> request,
            @AuthenticationPrincipal Object principal) {
        try {
            String accessToken = request.get("accessToken");
            String userEmail = request.get("userEmail");

            if (accessToken == null || accessToken.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "accessToken is required"));
            }
            if (userEmail == null || userEmail.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "userEmail is required"));
            }

            authService.linkGitHubToUser(userEmail, accessToken);
            return ResponseEntity.ok(java.util.Map.of("message", "GitHub connected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/github-callback")
    public ResponseEntity<?> githubCallback(@RequestBody java.util.Map<String, String> request) {
        try {
            String code = request.get("code");
            String userEmail = request.get("userEmail");

            if (code == null || code.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "code is required"));
            }
            if (userEmail == null || userEmail.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "userEmail is required"));
            }

            authService.exchangeGitHubCodeAndLink(code, userEmail);
            return ResponseEntity.ok(java.util.Map.of("message", "GitHub connected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
