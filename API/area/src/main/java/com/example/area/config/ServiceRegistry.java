package com.example.area.config;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Centralized registry for all available services, actions, and reactions.
 * This is the single source of truth for service definitions.
 */
@Component
public class ServiceRegistry {

    private final List<Map<String, Object>> services;

    public ServiceRegistry() {
        this.services = initializeServices();
    }

    private List<Map<String, Object>> initializeServices() {
        List<Map<String, Object>> serviceList = new ArrayList<>();

        // Timer Service - has ACTIONS only (triggers)
        Map<String, Object> timerService = new HashMap<>();
        timerService.put("id", 1);
        timerService.put("name", "timer");
        timerService.put("description", "Schedule automations at specific times");
        timerService.put("requiresOAuth", false);
        timerService.put("actions", List.of(
                Map.of(
                        "name", "time_at",
                        "description", "Trigger at a specific time (HH:mm)",
                        "configFields", List.of(
                                Map.of("name", "time", "type", "time", "label", "Time", "required", true)))));
        timerService.put("reactions", List.of()); // Timer has no reactions
        serviceList.add(timerService);

        // Mail Service - has REACTIONS only (responses)
        Map<String, Object> mailService = new HashMap<>();
        mailService.put("id", 2);
        mailService.put("name", "mail");
        mailService.put("description", "Send emails as part of your automations");
        mailService.put("requiresOAuth", false);
        mailService.put("actions", List.of()); // Mail has no actions
        mailService.put("reactions", List.of(
                Map.of(
                        "name", "send_email",
                        "description", "Send an email to a recipient",
                        "configFields", List.of(
                                Map.of("name", "to", "type", "email", "label", "Recipient Email", "required", true),
                                Map.of("name", "subject", "type", "text", "label", "Subject", "required", true),
                                Map.of("name", "body", "type", "textarea", "label", "Email Body", "required", true)))));
        serviceList.add(mailService);

        // GitHub Service - has both ACTIONS and REACTIONS
        Map<String, Object> githubService = new HashMap<>();
        githubService.put("id", 3);
        githubService.put("name", "github");
        githubService.put("description", "Connect to GitHub for repository automation");
        githubService.put("requiresOAuth", true);
        githubService.put("actions", List.of(
                Map.of(
                        "name", "new_push",
                        "description", "Trigger when code is pushed to a repository",
                        "configFields", List.of(
                                Map.of("name", "owner", "type", "text", "label", "Repository Owner", "required", true),
                                Map.of("name", "repo", "type", "text", "label", "Repository Name", "required", true))),
                Map.of(
                        "name", "new_issue",
                        "description", "Trigger when a new issue is created",
                        "configFields", List.of(
                                Map.of("name", "owner", "type", "text", "label", "Repository Owner", "required", true),
                                Map.of("name", "repo", "type", "text", "label", "Repository Name", "required",
                                        true)))));
        githubService.put("reactions", List.of(
                Map.of(
                        "name", "create_issue",
                        "description", "Create a new issue in a repository",
                        "configFields", List.of(
                                Map.of("name", "owner", "type", "text", "label", "Repository Owner", "required", true),
                                Map.of("name", "repo", "type", "text", "label", "Repository Name", "required", true),
                                Map.of("name", "title", "type", "text", "label", "Issue Title", "required", true),
                                Map.of("name", "body", "type", "textarea", "label", "Issue Body", "required", true))),
                Map.of(
                        "name", "create_comment",
                        "description", "Add a comment to an existing issue",
                        "configFields", List.of(
                                Map.of("name", "owner", "type", "text", "label", "Repository Owner", "required", true),
                                Map.of("name", "repo", "type", "text", "label", "Repository Name", "required", true),
                                Map.of("name", "issue_number", "type", "number", "label", "Issue Number", "required",
                                        true),
                                Map.of("name", "body", "type", "textarea", "label", "Comment Body", "required",
                                        true)))));
        serviceList.add(githubService);

        return serviceList;
    }

    /**
     * Get all available services with their actions and reactions.
     */
    public List<Map<String, Object>> getAllServices() {
        return new ArrayList<>(services);
    }

    /**
     * Get a specific service by name.
     */
    public Optional<Map<String, Object>> getServiceByName(String name) {
        return services.stream()
                .filter(s -> name.equalsIgnoreCase((String) s.get("name")))
                .findFirst();
    }

    /**
     * Check if a service name is valid.
     */
    public boolean isValidService(String name) {
        return getServiceByName(name).isPresent();
    }

    /**
     * Get all services that have at least one action.
     */
    public List<Map<String, Object>> getServicesWithActions() {
        return services.stream()
                .filter(s -> {
                    List<?> actions = (List<?>) s.get("actions");
                    return actions != null && !actions.isEmpty();
                })
                .toList();
    }

    /**
     * Get all services that have at least one reaction.
     */
    public List<Map<String, Object>> getServicesWithReactions() {
        return services.stream()
                .filter(s -> {
                    List<?> reactions = (List<?>) s.get("reactions");
                    return reactions != null && !reactions.isEmpty();
                })
                .toList();
    }

    /**
     * Get service definitions formatted for about.json endpoint.
     */
    public List<Map<String, Object>> getServicesForAbout() {
        List<Map<String, Object>> aboutServices = new ArrayList<>();

        for (Map<String, Object> service : services) {
            Map<String, Object> aboutService = new HashMap<>();
            aboutService.put("name", service.get("name"));

            // Extract action names and descriptions only
            List<?> actions = (List<?>) service.get("actions");
            List<Map<String, Object>> aboutActions = new ArrayList<>();
            if (actions != null) {
                for (Object action : actions) {
                    Map<String, Object> actionMap = (Map<String, Object>) action;
                    aboutActions.add(Map.of(
                            "name", actionMap.get("name"),
                            "description", actionMap.get("description")));
                }
            }
            aboutService.put("actions", aboutActions);

            // Extract reaction names and descriptions only
            List<?> reactions = (List<?>) service.get("reactions");
            List<Map<String, Object>> aboutReactions = new ArrayList<>();
            if (reactions != null) {
                for (Object reaction : reactions) {
                    Map<String, Object> reactionMap = (Map<String, Object>) reaction;
                    aboutReactions.add(Map.of(
                            "name", reactionMap.get("name"),
                            "description", reactionMap.get("description")));
                }
            }
            aboutService.put("reactions", aboutReactions);

            aboutServices.add(aboutService);
        }

        return aboutServices;
    }
}
