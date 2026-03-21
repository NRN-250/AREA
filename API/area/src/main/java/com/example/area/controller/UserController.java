package com.example.area.controller;

import com.example.area.entity.User;
import com.example.area.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/user/profile")
public class UserController {

    private final UserRepository userRepository;
    private final SecretKey secretKey;

    public UserController(UserRepository userRepository, SecretKey secretKey) {
        this.userRepository = userRepository;
        this.secretKey = secretKey;
    }

    public static class ProfileRequest {
        public String name;
        public String username;
        public String email;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal String email) {
        if (email == null) return ResponseEntity.status(401).body("Unauthorized");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");

        return ResponseEntity.ok(Map.of(
                "name", user.getName() != null ? user.getName() : "",
                "username", user.getUsername() != null ? user.getUsername() : "",
                "email", user.getEmail()
        ));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal String currentEmail, @RequestBody ProfileRequest request) {
        if (currentEmail == null) return ResponseEntity.status(401).body("Unauthorized");

        User user = userRepository.findByEmail(currentEmail).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");

        // Check if changing email and email is already taken
        if (request.email != null && !request.email.equals(currentEmail)) {
            if (userRepository.findByEmail(request.email).isPresent()) {
                return ResponseEntity.badRequest().body("Email is already in use by another account");
            }
            user.setEmail(request.email);
        }

        if (request.name != null) user.setName(request.name);
        if (request.username != null) user.setUsername(request.username);

        userRepository.save(user);

        // Generate a new token if the email changed (because email is the JWT subject)
        String newToken = null;
        if (request.email != null && !request.email.equals(currentEmail)) {
            newToken = Jwts.builder()
                    .setSubject(user.getEmail())
                    .setIssuedAt(new Date())
                    .setExpiration(Date.from(Instant.now().plusSeconds(3600)))
                    .signWith(secretKey, SignatureAlgorithm.HS256)
                    .compact();
        }

        if (newToken != null) {
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully", "token", newToken));
        } else {
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        }
    }
}
