package com.example.area.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    @Value("${resend.api.key}")
    private String resendApiKey;

    public void send(String to, String subject, String body) {
        try {
            log.info("Sending email to {} via Resend API with subject: {}", to, subject);

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from", "onboarding@resend.dev");
            requestBody.put("to", List.of(to));
            requestBody.put("subject", subject);
            requestBody.put("html", "<p>" + body.replace("\n", "<br>") + "</p>");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.resend.com/emails",
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            log.info("Email sent successfully to {}. Resend Response: {}", to, response.getBody());
        } catch (Exception e) {
            log.error("Failed to send email via Resend to {}: {}", to, e.getMessage());
            throw new RuntimeException("Resend API failed: " + e.getMessage(), e);
        }
    }
}
