package com.example.area.controller;

import com.example.area.entity.Area;
import com.example.area.entity.User;
import com.example.area.repository.AreaRepository;
import com.example.area.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/areas")
public class AreaController {

    private final AreaRepository areaRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public AreaController(AreaRepository areaRepository, UserRepository userRepository, ObjectMapper objectMapper) {
        this.areaRepository = areaRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<?> getAreas(@AuthenticationPrincipal Object principal) {
        User user = extractUser(principal);
        List<Area> areas = areaRepository.findByUser(user);

        List<Map<String, Object>> response = new ArrayList<>();
        for (Area area : areas) {
            Map<String, Object> areaMap = new HashMap<>();
            areaMap.put("id", area.getId());
            areaMap.put("name", area.getName());
            areaMap.put("actionServiceId", area.getActionServiceId());
            areaMap.put("actionType", area.getActionType());
            areaMap.put("actionConfig", parseJson(area.getActionConfig()));
            areaMap.put("reactionServiceId", area.getReactionServiceId());
            areaMap.put("reactionType", area.getReactionType());
            areaMap.put("reactionConfig", parseJson(area.getReactionConfig()));
            areaMap.put("enabled", area.getEnabled());
            areaMap.put("createdAt", area.getCreatedAt());
            areaMap.put("lastTriggered", area.getLastTriggered());
            response.add(areaMap);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createArea(
            @AuthenticationPrincipal Object principal,
            @RequestBody Map<String, Object> request) {
        User user = extractUser(principal);

        if (!request.containsKey("name") || !request.containsKey("actionServiceId")
                || !request.containsKey("actionType") || !request.containsKey("reactionServiceId")
                || !request.containsKey("reactionType")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }

        Area area = new Area();
        area.setUser(user);
        area.setName((String) request.get("name"));
        area.setActionServiceId(((String) request.get("actionServiceId")).toLowerCase());
        area.setActionType((String) request.get("actionType"));
        area.setActionConfig(toJson(request.get("actionConfig")));
        area.setReactionServiceId(((String) request.get("reactionServiceId")).toLowerCase());
        area.setReactionType((String) request.get("reactionType"));
        area.setReactionConfig(toJson(request.get("reactionConfig")));
        area.setEnabled((Boolean) request.getOrDefault("enabled", true));

        area = (Area) areaRepository.save(area);

        Map<String, Object> response = new HashMap<>();
        response.put("id", area.getId());
        response.put("name", area.getName());
        response.put("actionServiceId", area.getActionServiceId());
        response.put("actionType", area.getActionType());
        response.put("reactionServiceId", area.getReactionServiceId());
        response.put("reactionType", area.getReactionType());
        response.put("enabled", area.getEnabled());
        response.put("createdAt", area.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateArea(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        User user = extractUser(principal);

        Optional<Area> optionalArea = areaRepository.findById(id);
        if (optionalArea.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Area area = optionalArea.get();

        if (!area.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        if (request.containsKey("name")) {
            area.setName((String) request.get("name"));
        }
        if (request.containsKey("enabled")) {
            area.setEnabled((Boolean) request.get("enabled"));
        }
        if (request.containsKey("actionConfig")) {
            area.setActionConfig(toJson(request.get("actionConfig")));
        }
        if (request.containsKey("reactionConfig")) {
            area.setReactionConfig(toJson(request.get("reactionConfig")));
        }

        area = (Area) areaRepository.save(area);

        Map<String, Object> response = new HashMap<>();
        response.put("id", area.getId());
        response.put("name", area.getName());
        response.put("enabled", area.getEnabled());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArea(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id) {
        User user = extractUser(principal);

        Optional<Area> optionalArea = areaRepository.findById(id);
        if (optionalArea.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Area area = optionalArea.get();

        // Check ownership
        if (!area.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }

        areaRepository.delete(area);
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

    private String toJson(Object obj) {
        if (obj == null) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private Object parseJson(String json) {
        if (json == null || json.isEmpty()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}
