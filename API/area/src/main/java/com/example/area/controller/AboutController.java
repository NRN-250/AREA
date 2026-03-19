package com.example.area.controller;

import com.example.area.config.ServiceRegistry;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class AboutController {

        private final ServiceRegistry serviceRegistry;

        public AboutController(ServiceRegistry serviceRegistry) {
                this.serviceRegistry = serviceRegistry;
        }

        @GetMapping("/about.json")
        public Map<String, Object> getAbout(HttpServletRequest request) {
                String clientHost = request.getRemoteAddr();
                long currentTime = Instant.now().getEpochSecond();

                return Map.of(
                                "client", Map.of(
                                                "host", clientHost),
                                "server", Map.of(
                                                "current_time", currentTime,
                                                "services", serviceRegistry.getServicesForAbout()));
        }
}
