package com.example.area.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service for interacting with GitHub API.
 */
@Service
public class GitHubService {

    private static final Logger log = LoggerFactory.getLogger(GitHubService.class);
    private static final String GITHUB_API_BASE = "https://api.github.com";

    private final RestTemplate restTemplate;

    public GitHubService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Create a new issue in a repository.
     */
    public Map<String, Object> createIssue(String token, String owner, String repo, String title, String body) {
        String url = String.format("%s/repos/%s/%s/issues", GITHUB_API_BASE, owner, repo);

        HttpHeaders headers = createHeaders(token);
        Map<String, String> requestBody = Map.of(
                "title", title,
                "body", body);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Creating issue in {}/{}: {}", owner, repo, title);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            log.info("Issue created successfully: {}", response.getBody().get("html_url"));
            return response.getBody();
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("GitHub API rejected Create Issue [{}]: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to create GitHub issue: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Failed to create issue: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create GitHub issue: " + e.getMessage(), e);
        }
    }

    /**
     * Create a comment on an issue.
     */
    public Map<String, Object> createComment(String token, String owner, String repo, int issueNumber, String body) {
        String url = String.format("%s/repos/%s/%s/issues/%d/comments", GITHUB_API_BASE, owner, repo, issueNumber);

        HttpHeaders headers = createHeaders(token);
        Map<String, String> requestBody = Map.of("body", body);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Creating comment on issue #{} in {}/{}", issueNumber, owner, repo);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            log.info("Comment created successfully: {}", response.getBody().get("html_url"));
            return response.getBody();
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("GitHub API rejected Create Comment [{}]: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to create GitHub comment: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Failed to create comment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create GitHub comment: " + e.getMessage(), e);
        }
    }

    /**
     * Get user info for the authenticated user.
     */
    public Map<String, Object> getUserInfo(String token) {
        String url = GITHUB_API_BASE + "/user";

        HttpHeaders headers = createHeaders(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to get user info: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get GitHub user info: " + e.getMessage(), e);
        }
    }

    private HttpHeaders createHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + token);
        headers.set("Accept", "application/vnd.github+json");
        headers.set("X-GitHub-Api-Version", "2022-11-28");
        return headers;
    }
}
