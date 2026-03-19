package com.example.area.controller;

import com.example.area.config.ServiceRegistry;
import com.example.area.entity.User;
import com.example.area.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/services")
public class UserServiceController {

    private final UserRepository userRepository;
    private final ServiceRegistry serviceRegistry;

    public UserServiceController(UserRepository userRepository, ServiceRegistry serviceRegistry) {
        this.userRepository = userRepository;
        this.serviceRegistry = serviceRegistry;
    }

    @GetMapping
    public ResponseEntity<?> getUserServices(@AuthenticationPrincipal Object principal) {
        User user = extractUser(principal);

        List<Map<String, Object>> allServices = serviceRegistry.getAllServices();

        List<Map<String, Object>> connectedServices = new ArrayList<>();

        for (String serviceName : user.getConnectedServices()) {
            for (Map<String, Object> service : allServices) {
                if (service.get("name").equals(serviceName)) {
                    connectedServices.add(service);
                    break;
                }
            }
        }

        return ResponseEntity.ok(connectedServices);
    }

    @PostMapping
    public ResponseEntity<?> connectService(
            @AuthenticationPrincipal Object principal,
            @RequestBody Map<String, String> body) {
        User user = extractUser(principal);

        String serviceName = body.get("serviceName");
        if (serviceName == null || serviceName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "serviceName is required"));
        }

        serviceName = serviceName.toLowerCase();

        if (!serviceRegistry.isValidService(serviceName)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid service name"));
        }

        user.addService(serviceName);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Service connected successfully"));
    }

    @DeleteMapping("/{serviceName}")
    public ResponseEntity<?> disconnectService(
            @AuthenticationPrincipal Object principal,
            @PathVariable String serviceName) {
        User user = extractUser(principal);

        serviceName = serviceName.toLowerCase();

        user.removeService(serviceName);
        userRepository.save(user);

        return ResponseEntity.noContent().build();
    }

    private User extractUser(Object principal) {
        if (principal instanceof OAuth2User oauthUser) {
            String email = oauthUser.getAttribute("email");
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
            return userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        if (principal instanceof String email) {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        throw new RuntimeException("Unauthorized");
    }

    @GetMapping("/connect/github")
    public void connectGitHub(@AuthenticationPrincipal Object principal,
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        User user = extractUser(principal);
        request.getSession().setAttribute("linkingUserEmail", user.getEmail());
        response.sendRedirect("/oauth2/authorization/github");
    }
}
