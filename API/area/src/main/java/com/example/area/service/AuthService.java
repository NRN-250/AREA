package com.example.area.service;

import com.example.area.entity.User;
import com.example.area.repository.UserRepository;
import com.example.area.v1.DTOs.login.LoginRequest;
import com.example.area.v1.DTOs.register.RegisterRequest;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecretKey secretKey;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, SecretKey secretKey) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.secretKey = secretKey;
    }

    public User register(RegisterRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider("local");
        user.setConfirmed(true); // skip email confirmation for now
        return userRepository.save(user);
    }

    public String login(LoginRequest request) throws Exception {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new Exception("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new Exception("Invalid password");
        }

        return Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String loginWithGoogleToken(String accessToken) throws Exception {
        // Call Google API to validate token and get user info
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        String url = "https://www.googleapis.com/oauth2/v3/userinfo";

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(accessToken);
        org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);

        try {
            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.exchange(
                    url, org.springframework.http.HttpMethod.GET, entity, java.util.Map.class);

            java.util.Map<String, Object> userInfo = response.getBody();
            if (userInfo == null || !userInfo.containsKey("email")) {
                throw new Exception("Failed to get user info from Google");
            }

            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");

            // Find or create user
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setUsername(name != null ? name : email.split("@")[0]);
                newUser.setPassword("OAUTH_USER");
                newUser.setProvider("google");
                newUser.setConfirmed(true);
                return userRepository.save(newUser);
            });

            // Generate JWT
            return Jwts.builder()
                    .setSubject(user.getEmail())
                    .setIssuedAt(new Date())
                    .setExpiration(Date.from(Instant.now().plusSeconds(3600)))
                    .signWith(secretKey, SignatureAlgorithm.HS256)
                    .compact();
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new Exception("Invalid Google access token");
        }
    }

    public void linkGitHubToUser(String userEmail, String accessToken) throws Exception {
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        String url = "https://api.github.com/user";

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.set("Accept", "application/vnd.github+json");
        org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);

        try {
            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.exchange(
                    url, org.springframework.http.HttpMethod.GET, entity, java.util.Map.class);

            java.util.Map<String, Object> githubUser = response.getBody();
            if (githubUser == null) {
                throw new Exception("Failed to get user info from GitHub");
            }

            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new Exception("User not found"));

            user.addService("github");
            user.setGithubAccessToken(accessToken);
            userRepository.save(user);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new Exception("Invalid GitHub access token");
        }
    }

    public void exchangeGitHubCodeAndLink(String code, String userEmail) throws Exception {
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

        // GitHub OAuth token exchange
        String tokenUrl = "https://github.com/login/oauth/access_token";

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("Accept", "application/json");
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        java.util.Map<String, String> body = new java.util.HashMap<>();
        body.put("client_id", "Ov23liUp1tnGuvLCRw4L");
        body.put("client_secret", "d9174d83e93aa094b33125f44dcfcc0cf560c6d6");
        body.put("code", code);

        org.springframework.http.HttpEntity<java.util.Map<String, String>> entity = new org.springframework.http.HttpEntity<>(
                body, headers);

        try {
            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.exchange(
                    tokenUrl, org.springframework.http.HttpMethod.POST, entity, java.util.Map.class);

            java.util.Map<String, Object> tokenResponse = response.getBody();
            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                String error = tokenResponse != null ? (String) tokenResponse.get("error_description")
                        : "Unknown error";
                throw new Exception("Failed to get access token from GitHub: " + error);
            }

            String accessToken = (String) tokenResponse.get("access_token");

            // Now link GitHub to the user
            linkGitHubToUser(userEmail, accessToken);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new Exception("Failed to exchange GitHub code: " + e.getMessage());
        }
    }
}
