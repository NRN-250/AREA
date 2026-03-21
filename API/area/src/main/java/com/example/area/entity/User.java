package com.example.area.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String name;

    private String username;

    @Column(nullable = false)
    private Boolean confirmed = false;

    private String provider; // "local", "google", or "github"

    private String confirmationToken;

    // Store OAuth access tokens for service API calls
    @Column(length = 500)
    private String githubAccessToken;

    // Store GitHub username for repo operations
    private String githubUsername;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_services", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "service_name")
    private List<String> connectedServices = new ArrayList<>();

    public void addService(String service) {
        if (!connectedServices.contains(service)) {
            connectedServices.add(service);
        }
    }

    public void removeService(String service) {
        connectedServices.remove(service);
    }
}
