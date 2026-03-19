package com.example.area.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ServiceRegistryTest {

    @Autowired
    private ServiceRegistry serviceRegistry;

    @Test
    void getAllServicesReturnsThreeServices() {
        List<Map<String, Object>> services = serviceRegistry.getAllServices();
        assertEquals(3, services.size(), "Should have exactly 3 services");
    }

    @Test
    void timerServiceExists() {
        var timer = serviceRegistry.getServiceByName("timer");
        assertTrue(timer.isPresent(), "Timer service should exist");
        assertEquals("timer", timer.get().get("name"));
        assertFalse((Boolean) timer.get().get("requiresOAuth"), "Timer should not require OAuth");
    }

    @Test
    void mailServiceExists() {
        var mail = serviceRegistry.getServiceByName("mail");
        assertTrue(mail.isPresent(), "Mail service should exist");
        assertEquals("mail", mail.get().get("name"));
        assertFalse((Boolean) mail.get().get("requiresOAuth"), "Mail should not require OAuth");
    }

    @Test
    void githubServiceExists() {
        var github = serviceRegistry.getServiceByName("github");
        assertTrue(github.isPresent(), "GitHub service should exist");
        assertEquals("github", github.get().get("name"));
        assertTrue((Boolean) github.get().get("requiresOAuth"), "GitHub should require OAuth");
    }

    @Test
    void timerHasActions() {
        var timer = serviceRegistry.getServiceByName("timer").orElseThrow();
        List<?> actions = (List<?>) timer.get("actions");
        assertFalse(actions.isEmpty(), "Timer should have at least one action");
    }

    @Test
    void mailHasReactions() {
        var mail = serviceRegistry.getServiceByName("mail").orElseThrow();
        List<?> reactions = (List<?>) mail.get("reactions");
        assertFalse(reactions.isEmpty(), "Mail should have at least one reaction");
    }

    @Test
    void githubHasBothActionsAndReactions() {
        var github = serviceRegistry.getServiceByName("github").orElseThrow();
        List<?> actions = (List<?>) github.get("actions");
        List<?> reactions = (List<?>) github.get("reactions");
        assertFalse(actions.isEmpty(), "GitHub should have actions");
        assertFalse(reactions.isEmpty(), "GitHub should have reactions");
    }

    @Test
    void isValidServiceReturnsTrueForExistingServices() {
        assertTrue(serviceRegistry.isValidService("timer"));
        assertTrue(serviceRegistry.isValidService("mail"));
        assertTrue(serviceRegistry.isValidService("github"));
        assertTrue(serviceRegistry.isValidService("GITHUB")); // Case insensitive
    }

    @Test
    void isValidServiceReturnsFalseForNonExistingServices() {
        assertFalse(serviceRegistry.isValidService("nonexistent"));
        assertFalse(serviceRegistry.isValidService(""));
    }

    @Test
    void getServicesForAboutReturnsCorrectFormat() {
        List<Map<String, Object>> aboutServices = serviceRegistry.getServicesForAbout();
        assertEquals(3, aboutServices.size());

        for (Map<String, Object> service : aboutServices) {
            assertTrue(service.containsKey("name"), "Each service should have a name");
            assertTrue(service.containsKey("actions"), "Each service should have actions");
            assertTrue(service.containsKey("reactions"), "Each service should have reactions");
        }
    }
}
