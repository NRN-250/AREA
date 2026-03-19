package com.example.area.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "areas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String actionServiceId; // "timer", "mail", etc.

    @Column(nullable = false)
    private String actionType; // "time_at", etc.

    @Column(columnDefinition = "TEXT")
    private String actionConfig; // JSON string

    @Column(nullable = false)
    private String reactionServiceId; // "timer", "mail", etc.

    @Column(nullable = false)
    private String reactionType; // "send_email", etc.

    @Column(columnDefinition = "TEXT")
    private String reactionConfig; // JSON string

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastTriggered;
}
