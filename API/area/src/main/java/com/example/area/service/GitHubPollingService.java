package com.example.area.service;

import com.example.area.entity.Area;
import com.example.area.entity.User;
import com.example.area.repository.AreaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.transaction.Transactional;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Polling service for GitHub events.
 * This checks GitHub API periodically for new pushes/issues instead of relying
 * on webhooks.
 * More reliable for demo/defense as it doesn't require ngrok or public URLs.
 */
@Service
public class GitHubPollingService {

    private static final Logger log = LoggerFactory.getLogger(GitHubPollingService.class);
    private static final String GITHUB_API_BASE = "https://api.github.com";

    private final AreaRepository areaRepository;
    private final GitHubService gitHubService;
    private final MailService mailService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public GitHubPollingService(AreaRepository areaRepository, GitHubService gitHubService,
            MailService mailService, ObjectMapper objectMapper) {
        this.areaRepository = areaRepository;
        this.gitHubService = gitHubService;
        this.mailService = mailService;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Check GitHub actions every 60 seconds.
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void checkGitHubActions() {
        log.info("Checking GitHub actions...");

        // Find all enabled AREAs with GitHub actions
        List<Area> areas = areaRepository.findAll().stream()
                .filter(Area::getEnabled)
                .filter(a -> "github".equals(a.getActionServiceId()))
                .toList();

        for (Area area : areas) {
            try {
                checkAreaForGitHubEvents(area);
            } catch (Exception e) {
                log.error("Error checking GitHub for AREA {}: {}", area.getId(), e.getMessage());
            }
        }
    }

    private void checkAreaForGitHubEvents(Area area) {
        User user = area.getUser();
        String githubToken = user.getGithubAccessToken();

        if (githubToken == null || githubToken.isEmpty()) {
            log.debug("AREA {}: User has no GitHub token, skipping", area.getId());
            return;
        }

        Map<String, Object> actionConfig = parseConfig(area.getActionConfig());
        String owner = (String) actionConfig.get("owner");
        String repo = (String) actionConfig.get("repo");

        if (owner == null || repo == null) {
            return;
        }

        String actionType = area.getActionType();

        // eventData will contain info from the trigger (like issue number)
        Map<String, Object> eventData = new HashMap<>();
        boolean shouldTrigger = false;

        if ("new_push".equals(actionType)) {
            shouldTrigger = checkForNewPush(githubToken, owner, repo, area, eventData);
        } else if ("new_issue".equals(actionType)) {
            shouldTrigger = checkForNewIssue(githubToken, owner, repo, area, eventData);
        }

        if (shouldTrigger) {
            log.info("GitHub event detected for AREA '{}', executing reaction", area.getName());
            executeReaction(area, eventData);
            area.setLastTriggered(LocalDateTime.now());
            areaRepository.save(area);
        }
    }

    private boolean checkForNewPush(String token, String owner, String repo, Area area, Map<String, Object> eventData) {
        try {
            String url = String.format("%s/repos/%s/%s/commits?per_page=1", GITHUB_API_BASE, owner, repo);
            HttpHeaders headers = createHeaders(token);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode commits = objectMapper.readTree(response.getBody());

            if (commits.isArray() && commits.size() > 0) {
                JsonNode latestCommit = commits.get(0);
                String commitDateStr = latestCommit.path("commit").path("author").path("date").asText();
                Instant commitTime = Instant.parse(commitDateStr);
                LocalDateTime commitDateTime = LocalDateTime.ofInstant(commitTime, ZoneId.systemDefault());

                // Check if this commit is newer than last triggered
                if (area.getLastTriggered() == null || commitDateTime.isAfter(area.getLastTriggered())) {
                    String commitMessage = latestCommit.path("commit").path("message").asText().split("\n")[0];
                    log.info("New push detected in {}/{}: {}", owner, repo, commitMessage);

                    // Store event data for use in reactions
                    eventData.put("commit_message", commitMessage);
                    eventData.put("commit_sha", latestCommit.path("sha").asText());
                    eventData.put("owner", owner);
                    eventData.put("repo", repo);
                    return true;
                }
            }
        } catch (Exception e) {
            log.error("Error checking for new push in {}/{}: {}", owner, repo, e.getMessage());
        }
        return false;
    }

    private boolean checkForNewIssue(String token, String owner, String repo, Area area,
            Map<String, Object> eventData) {
        try {
            String url = String.format("%s/repos/%s/%s/issues?state=open&sort=created&direction=desc&per_page=1",
                    GITHUB_API_BASE, owner, repo);
            HttpHeaders headers = createHeaders(token);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode issues = objectMapper.readTree(response.getBody());

            if (issues.isArray() && issues.size() > 0) {
                JsonNode latestIssue = issues.get(0);

                // Filter out pull requests (they also appear as issues in API)
                if (latestIssue.has("pull_request")) {
                    return false;
                }

                String createdAtStr = latestIssue.path("created_at").asText();
                Instant issueTime = Instant.parse(createdAtStr);
                LocalDateTime issueDateTime = LocalDateTime.ofInstant(issueTime, ZoneId.systemDefault());

                // Check if this issue is newer than last triggered
                if (area.getLastTriggered() == null || issueDateTime.isAfter(area.getLastTriggered())) {
                    int issueNumber = latestIssue.path("number").asInt();
                    String issueTitle = latestIssue.path("title").asText();
                    log.info("New issue detected in {}/{}: #{} - {}", owner, repo, issueNumber, issueTitle);

                    // Store event data for use in reactions - this is the KEY part!
                    eventData.put("issue_number", issueNumber);
                    eventData.put("issue_title", issueTitle);
                    eventData.put("owner", owner);
                    eventData.put("repo", repo);
                    return true;
                }
            }
        } catch (Exception e) {
            log.error("Error checking for new issues in {}/{}: {}", owner, repo, e.getMessage());
        }
        return false;
    }

    private void executeReaction(Area area, Map<String, Object> eventData) {
        String reactionService = area.getReactionServiceId();
        String reactionType = area.getReactionType();

        try {
            Map<String, Object> reactionConfig = parseConfig(area.getReactionConfig());

            if ("mail".equals(reactionService) && "send_email".equals(reactionType)) {
                String to = (String) reactionConfig.get("to");
                String subject = (String) reactionConfig.get("subject");
                String body = (String) reactionConfig.get("body");
                mailService.send(to, subject, body);
                log.info("Email sent for AREA '{}'", area.getName());

            } else if ("github".equals(reactionService) && "create_issue".equals(reactionType)) {
                User user = area.getUser();
                String githubToken = user.getGithubAccessToken();
                if (githubToken == null || githubToken.isEmpty()) {
                    log.error("AREA '{}': User has no GitHub access token", area.getName());
                    return;
                }
                String owner = (String) reactionConfig.get("owner");
                String repo = (String) reactionConfig.get("repo");
                String title = (String) reactionConfig.get("title");
                String body = (String) reactionConfig.get("body");
                gitHubService.createIssue(githubToken, owner, repo, title, body != null ? body : "");
                log.info("GitHub issue created for AREA '{}'", area.getName());

            } else if ("github".equals(reactionService) && "create_comment".equals(reactionType)) {
                User user = area.getUser();
                String githubToken = user.getGithubAccessToken();
                if (githubToken == null || githubToken.isEmpty()) {
                    log.error("AREA '{}': User has no GitHub access token", area.getName());
                    return;
                }
                String owner = (String) reactionConfig.get("owner");
                String repo = (String) reactionConfig.get("repo");

                // Get issue number - first check eventData (from new_issue action), then config
                int issueNumber;
                if (eventData.containsKey("issue_number")) {
                    // Use the issue number from the triggering event (new_issue action)
                    issueNumber = (int) eventData.get("issue_number");
                    log.info("Using issue number {} from triggering event", issueNumber);
                } else {
                    // Fall back to configured issue number
                    Object issueNumObj = reactionConfig.get("issue_number");
                    issueNumber = issueNumObj instanceof Number ? ((Number) issueNumObj).intValue()
                            : Integer.parseInt((String) issueNumObj);
                }

                String body = (String) reactionConfig.get("body");
                gitHubService.createComment(githubToken, owner, repo, issueNumber, body);
                log.info("GitHub comment created on issue #{} for AREA '{}'", issueNumber, area.getName());

            } else {
                log.warn("Unknown reaction: {}/{}", reactionService, reactionType);
            }
        } catch (Exception e) {
            log.error("Failed to execute reaction for AREA '{}': {}", area.getName(), e.getMessage(), e);
        }
    }

    private HttpHeaders createHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.set("Accept", "application/vnd.github+json");
        headers.set("X-GitHub-Api-Version", "2022-11-28");
        return headers;
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
