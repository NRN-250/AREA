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

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    public void send(String to, String subject, String body) {
        try {
            log.info("Sending email to {} via Brevo API with subject: {}", to, subject);

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            headers.set("api-key", brevoApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            
            // Sender Identity
            Map<String, String> sender = new HashMap<>();
            sender.put("name", "Area Support");
            sender.put("email", "noreply@area.support"); // Must be correctly verified inside Brevo Dashboard!
            requestBody.put("sender", sender);

            // Recipient Identity
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", to);
            requestBody.put("to", List.of(recipient));

            requestBody.put("subject", subject);
            requestBody.put("htmlContent", "<p>" + body.replace("\n", "<br>") + "</p>");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.brevo.com/v3/smtp/email",
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            log.info("Email sent successfully to {}. Brevo Response: {}", to, response.getBody());
        } catch (Exception e) {
            log.error("Failed to send email via Brevo to {}: {}", to, e.getMessage());
            throw new RuntimeException("Brevo API failed: " + e.getMessage(), e);
        }
    }
}
