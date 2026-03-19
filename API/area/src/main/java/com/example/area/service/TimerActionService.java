package com.example.area.service;

import com.example.area.entity.Area;
import com.example.area.entity.EmailReaction;
import com.example.area.entity.TimerAction;
import com.example.area.entity.User;
import com.example.area.repository.AreaRepository;
import com.example.area.repository.EmailReactionRepository;
import com.example.area.repository.TimerActionRepository;
import com.example.area.repository.UserRepository;
import com.example.area.v1.DTOs.timer.CreateTimerActionRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
public class TimerActionService {

    private static final Logger log = LoggerFactory.getLogger(TimerActionService.class);

    private final TimerActionRepository timerActionRepository;
    private final EmailReactionRepository emailReactionRepository;
    private final UserRepository userRepository;
    private final AreaRepository areaRepository;
    private final MailService mailService;
    private final ObjectMapper objectMapper;

    public TimerActionService(
            TimerActionRepository timerActionRepository,
            EmailReactionRepository emailReactionRepository,
            UserRepository userRepository,
            AreaRepository areaRepository,
            MailService mailService,
            ObjectMapper objectMapper) {
        this.timerActionRepository = timerActionRepository;
        this.emailReactionRepository = emailReactionRepository;
        this.userRepository = userRepository;
        this.areaRepository = areaRepository;
        this.mailService = mailService;
        this.objectMapper = objectMapper;
    }

    // -------------------------
    // CREATE TIMER + EMAIL (Legacy method - still works)
    // -------------------------
    @Transactional
    public TimerAction createTimerWithEmail(
            String userEmail,
            CreateTimerActionRequest request) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        LocalTime time = LocalTime.parse(request.getTime());

        TimerAction action = new TimerAction();
        action.setUser(user);
        action.setTargetTime(time);
        action.setEnabled(true);
        action.setLastTriggeredDate(null);

        timerActionRepository.save(action);

        EmailReaction reaction = new EmailReaction();
        reaction.setTimerAction(action);
        reaction.setToEmail(request.getEmail().getTo());
        reaction.setSubject(request.getEmail().getSubject());
        reaction.setBody(request.getEmail().getBody());

        emailReactionRepository.save(reaction);

        return action;
    }

    // -------------------------
    // SCHEDULER - Now checks both legacy TimerActions AND AREAs
    // -------------------------
    @Scheduled(fixedRate = 60_000) // Every 60 seconds
    @Transactional
    public void checkTimerActions() {
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);
        LocalDate today = LocalDate.now();

        log.info("Checking timer actions at {}", now);

        // Check legacy TimerActions
        checkLegacyTimerActions(now, today);

        // Check AREA-based timer actions
        checkAreaTimerActions(now, today);
    }

    private void checkLegacyTimerActions(LocalTime now, LocalDate today) {
        List<TimerAction> actions = timerActionRepository.findAll();

        for (TimerAction action : actions) {
            if (!action.isEnabled())
                continue;

            if (now.equals(action.getTargetTime())
                    && (action.getLastTriggeredDate() == null
                            || !today.equals(action.getLastTriggeredDate()))) {

                List<EmailReaction> reactions = emailReactionRepository.findByTimerAction(action);

                for (EmailReaction reaction : reactions) {
                    try {
                        mailService.send(
                                reaction.getToEmail(),
                                reaction.getSubject(),
                                reaction.getBody());
                        log.info("Email sent to {} for timer {}", reaction.getToEmail(), action.getId());
                    } catch (Exception e) {
                        log.error("Failed to send email for timer {}: {}", action.getId(), e.getMessage());
                    }
                }

                action.setLastTriggeredDate(today);
                timerActionRepository.save(action);

                log.info("Legacy Timer {} executed for user {}", action.getId(), action.getUser().getEmail());
            }
        }
    }

    private void checkAreaTimerActions(LocalTime now, LocalDate today) {
        // Find all enabled AREAs with timer actions
        List<Area> areas = areaRepository.findAll();

        for (Area area : areas) {
            if (!area.getEnabled())
                continue;
            if (!"timer".equals(area.getActionServiceId()))
                continue;
            if (!"time_at".equals(area.getActionType()))
                continue;

            try {
                // Parse action config
                Map<String, Object> actionConfig = parseConfig(area.getActionConfig());
                String timeStr = (String) actionConfig.get("time");

                if (timeStr == null || timeStr.isEmpty()) {
                    log.warn("AREA {} has no time configured", area.getId());
                    continue;
                }

                LocalTime targetTime = LocalTime.parse(timeStr);

                // Check if it's time to trigger and hasn't been triggered today
                boolean shouldTrigger = now.equals(targetTime.withSecond(0).withNano(0))
                        && (area.getLastTriggered() == null
                                || !area.getLastTriggered().toLocalDate().equals(today));

                if (shouldTrigger) {
                    // Execute the reaction
                    executeReaction(area);

                    // Update last triggered time
                    area.setLastTriggered(LocalDateTime.now());
                    areaRepository.save(area);

                    log.info("AREA {} '{}' triggered successfully at {}",
                            area.getId(), area.getName(), now);
                }
            } catch (Exception e) {
                log.error("Error processing AREA {}: {}", area.getId(), e.getMessage(), e);
            }
        }
    }

    private void executeReaction(Area area) {
        String reactionService = area.getReactionServiceId();
        String reactionType = area.getReactionType();

        if ("mail".equals(reactionService) && "send_email".equals(reactionType)) {
            executeEmailReaction(area);
        } else if ("github".equals(reactionService)) {
            executeGitHubReaction(area, reactionType);
        } else {
            log.warn("Unknown reaction: {}/{}", reactionService, reactionType);
        }
    }

    private void executeEmailReaction(Area area) {
        try {
            Map<String, Object> reactionConfig = parseConfig(area.getReactionConfig());

            String to = (String) reactionConfig.get("to");
            String subject = (String) reactionConfig.get("subject");
            String body = (String) reactionConfig.get("body");

            if (to == null || to.isEmpty()) {
                log.error("AREA {}: No recipient email configured", area.getId());
                return;
            }

            mailService.send(to, subject, body);
            log.info("Email sent to {} for AREA '{}'", to, area.getName());

        } catch (Exception e) {
            log.error("Failed to send email for AREA {}: {}", area.getId(), e.getMessage(), e);
        }
    }

    private void executeGitHubReaction(Area area, String reactionType) {
        try {
            // Get user's GitHub access token
            User user = area.getUser();
            if (user == null) {
                log.error("AREA {}: No user associated with area", area.getId());
                return;
            }

            String githubToken = user.getGithubAccessToken();
            if (githubToken == null || githubToken.isEmpty()) {
                log.error("AREA {}: User has no GitHub access token. User needs to reconnect GitHub.", area.getId());
                return;
            }

            Map<String, Object> reactionConfig = parseConfig(area.getReactionConfig());
            String owner = (String) reactionConfig.get("owner");
            String repo = (String) reactionConfig.get("repo");

            if (owner == null || repo == null) {
                log.error("AREA {}: Missing owner or repo in GitHub reaction config", area.getId());
                return;
            }

            // Execute the reaction based on type
            if ("create_issue".equals(reactionType)) {
                String title = (String) reactionConfig.get("title");
                String body = (String) reactionConfig.get("body");

                if (title == null || title.isEmpty()) {
                    log.error("AREA {}: Missing issue title", area.getId());
                    return;
                }

                // Make GitHub API call
                String url = String.format("https://api.github.com/repos/%s/%s/issues", owner, repo);
                makeGitHubApiCall(url, githubToken, Map.of("title", title, "body", body != null ? body : ""));
                log.info("GitHub issue created for AREA '{}'", area.getName());

            } else if ("create_comment".equals(reactionType)) {
                Object issueNumObj = reactionConfig.get("issue_number");
                String body = (String) reactionConfig.get("body");

                int issueNumber;
                if (issueNumObj instanceof Number) {
                    issueNumber = ((Number) issueNumObj).intValue();
                } else if (issueNumObj instanceof String) {
                    issueNumber = Integer.parseInt((String) issueNumObj);
                } else {
                    log.error("AREA {}: Invalid issue number", area.getId());
                    return;
                }

                if (body == null || body.isEmpty()) {
                    log.error("AREA {}: Missing comment body", area.getId());
                    return;
                }

                String url = String.format("https://api.github.com/repos/%s/%s/issues/%d/comments",
                        owner, repo, issueNumber);
                makeGitHubApiCall(url, githubToken, Map.of("body", body));
                log.info("GitHub comment created for AREA '{}'", area.getName());

            } else {
                log.warn("Unknown GitHub reaction type: {}", reactionType);
            }

        } catch (Exception e) {
            log.error("Failed to execute GitHub reaction for AREA {}: {}", area.getId(), e.getMessage(), e);
        }
    }

    private void makeGitHubApiCall(String url, String token, Map<String, String> body) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + token);
            headers.set("Accept", "application/vnd.github+json");
            headers.set("X-GitHub-Api-Version", "2022-11-28");

            org.springframework.http.HttpEntity<Map<String, String>> entity = new org.springframework.http.HttpEntity<>(
                    body, headers);

            restTemplate.exchange(url, org.springframework.http.HttpMethod.POST, entity, String.class);
        } catch (Exception e) {
            log.error("GitHub API call failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    private Map<String, Object> parseConfig(String json) {
        if (json == null || json.isEmpty() || json.equals("{}")) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            log.error("Failed to parse config: {}", json, e);
            return Map.of();
        }
    }
}
