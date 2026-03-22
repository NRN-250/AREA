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
import java.util.HashMap;
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

    public static class AvatarRequest {
        public String avatarUrl; // base64 data URL, e.g. "data:image/png;base64,..."
    }

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal String email) {
        if (email == null) return ResponseEntity.status(401).body("Unauthorized");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");

        Map<String, Object> response = new HashMap<>();
        response.put("name",      user.getName()      != null ? user.getName()      : "");
        response.put("username",  user.getUsername()  != null ? user.getUsername()  : "");
        response.put("email",     user.getEmail());
        response.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
        response.put("provider",  user.getProvider()  != null ? user.getProvider()  : "local");
        response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");

        return ResponseEntity.ok(response);
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

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@AuthenticationPrincipal String email, @RequestBody AvatarRequest request) {
        if (email == null) return ResponseEntity.status(401).body("Unauthorized");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");

        if (request.avatarUrl == null || request.avatarUrl.isBlank()) {
            return ResponseEntity.badRequest().body("avatarUrl is required");
        }

        // Limit size to ~2MB of base64 data
        if (request.avatarUrl.length() > 2_800_000) {
            return ResponseEntity.badRequest().body("Image too large. Please use an image under 2MB.");
        }

        user.setAvatarUrl(request.avatarUrl);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Avatar updated successfully", "avatarUrl", user.getAvatarUrl()));
    }
}
