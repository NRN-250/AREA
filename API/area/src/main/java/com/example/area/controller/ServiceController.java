package com.example.area.controller;

import com.example.area.config.ServiceRegistry;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/services")
public class ServiceController {

        private final ServiceRegistry serviceRegistry;

        public ServiceController(ServiceRegistry serviceRegistry) {
                this.serviceRegistry = serviceRegistry;
        }

        @GetMapping
        public List<Map<String, Object>> getServices() {
                return serviceRegistry.getAllServices();
        }

        @GetMapping("/with-actions")
        public List<Map<String, Object>> getServicesWithActions() {
                return serviceRegistry.getServicesWithActions();
        }

        @GetMapping("/with-reactions")
        public List<Map<String, Object>> getServicesWithReactions() {
                return serviceRegistry.getServicesWithReactions();
        }
}
