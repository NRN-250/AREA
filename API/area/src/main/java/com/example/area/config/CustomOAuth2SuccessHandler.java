package com.example.area.config;

import com.example.area.entity.User;
import com.example.area.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;
import java.util.Optional;

@Component
public class CustomOAuth2SuccessHandler
        implements org.springframework.security.web.authentication.AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2SuccessHandler.class);

    private final UserRepository userRepository;
    private final JwtConfig jwtConfig;
    private final OAuth2AuthorizedClientService authorizedClientService;

    @Value("${app.frontend.url:http://localhost:8081}")
    private String frontendUrl;

    public CustomOAuth2SuccessHandler(UserRepository userRepository, JwtConfig jwtConfig,
            OAuth2AuthorizedClientService authorizedClientService) {
        this.userRepository = userRepository;
        this.jwtConfig = jwtConfig;
        this.authorizedClientService = authorizedClientService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauthUser = oauthToken.getPrincipal();
        String provider = oauthToken.getAuthorizedClientRegistrationId();

        log.info("OAuth2 login success from provider: {}", provider);

        // Get the access token for API calls
        String accessToken = null;
        try {
            OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                    provider, oauthToken.getName());
            if (client != null) {
                OAuth2AccessToken oAuth2AccessToken = client.getAccessToken();
                if (oAuth2AccessToken != null) {
                    accessToken = oAuth2AccessToken.getTokenValue();
                    log.info("Captured {} access token for user", provider);
                }
            }
        } catch (Exception e) {
            log.warn("Could not retrieve access token: {}", e.getMessage());
        }

        String email;
        String name;
        String username;
        String githubUsername = null;

        if ("github".equals(provider)) {
            // GitHub returns different attributes
            email = oauthUser.getAttribute("email");
            name = oauthUser.getAttribute("login"); // GitHub uses "login" for username
            githubUsername = name;

            // GitHub email might be null if user has private email
            if (email == null) {
                email = name + "@github.com";
            }
            username = name;
        } else {
            // Google
            email = oauthUser.getAttribute("email");
            name = oauthUser.getAttribute("name");
            username = email != null ? email.split("@")[0] : name;
        }

        final String finalEmail = email;
        final String finalUsername = username;
        final String finalProvider = provider;
        final String finalAccessToken = accessToken;
        final String finalGithubUsername = githubUsername;

        // Check if user is LINKING GitHub to an existing account
        String linkingUserEmail = (String) request.getSession().getAttribute("linkingUserEmail");
        User user;

        if (linkingUserEmail != null) {
            // User is linking GitHub to their existing account
            request.getSession().removeAttribute("linkingUserEmail");
            log.info("Linking GitHub to existing user: {}", linkingUserEmail);

            Optional<User> existingUser = userRepository.findByEmail(linkingUserEmail);
            if (existingUser.isPresent()) {
                user = existingUser.get();
                // Store GitHub token on existing user
                if ("github".equals(finalProvider) && finalAccessToken != null) {
                    user.setGithubAccessToken(finalAccessToken);
                    if (finalGithubUsername != null) {
                        user.setGithubUsername(finalGithubUsername);
                    }
                    if (!user.getConnectedServices().contains("github")) {
                        user.addService("github");
                    }
                    log.info("Stored GitHub access token for existing user {}", user.getEmail());
                }
            } else {
                // Fallback: create new user
                user = new User();
                user.setUsername(finalUsername);
                user.setEmail(linkingUserEmail);
                user.setPassword("OAUTH_USER");
                user.setProvider(finalProvider);
            }
        } else {
            // Normal OAuth login - find by email
            Optional<User> existing = userRepository.findByEmail(finalEmail);

            if (existing.isPresent()) {
                user = existing.get();
                log.info("Found existing user by email: {}", finalEmail);
            } else {
                // Create new user
                user = new User();
                user.setUsername(finalUsername);
                user.setEmail(finalEmail);
                user.setPassword("OAUTH_USER");
                user.setProvider(finalProvider);
                log.info("Creating new user: {}", finalEmail);
            }

            // Store GitHub access token if logging in with GitHub
            if ("github".equals(finalProvider) && finalAccessToken != null) {
                user.setGithubAccessToken(finalAccessToken);
                if (finalGithubUsername != null) {
                    user.setGithubUsername(finalGithubUsername);
                }
                if (!user.getConnectedServices().contains("github")) {
                    user.addService("github");
                }
                log.info("Stored GitHub access token for user {}", user.getEmail());
            }
        }

        userRepository.save(user);

        String token;
        try {
            token = Jwts.builder()
                    .setSubject(user.getEmail())
                    .claim("email", user.getEmail())
                    .claim("id", user.getId())
                    .claim("username", user.getUsername())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                    .signWith(jwtConfig.jwtSecretKey(), SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create JWT token", e);
        }

        // Try to detect frontend origin from referer, otherwise use configured default
        String origin = request.getHeader("Referer");
        String redirectBase = frontendUrl;

        if (origin != null) {
            if (origin.contains("localhost:5173")) {
                redirectBase = "http://localhost:5173";
            } else if (origin.contains("localhost:8081")) {
                redirectBase = "http://localhost:8081";
            } else if (origin.contains("localhost:3000")) {
                redirectBase = "http://localhost:3000";
            }
        }

        String redirectUrl = String.format(
                "%s/auth/success?token=%s",
                redirectBase,
                java.net.URLEncoder.encode(token, java.nio.charset.StandardCharsets.UTF_8));

        response.sendRedirect(redirectUrl);
    }
}
