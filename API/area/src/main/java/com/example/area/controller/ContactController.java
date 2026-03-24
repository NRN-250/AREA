package com.example.area.controller;

import com.example.area.dto.ContactRequest;
import com.example.area.service.MailService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);
    private final MailService mailService;

    @Value("${recaptcha.secret-key:}")
    private String recaptchaSecretKey;

    private static final String RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    public ContactController(MailService mailService) {
        this.mailService = mailService;
    }

    @PostMapping
    public ResponseEntity<?> submitContactForm(@Valid @RequestBody ContactRequest request) {
        // 1. Verify reCAPTCHA if a secret key is configured
        if (recaptchaSecretKey != null && !recaptchaSecretKey.isBlank()) {
            if (request.getRecaptchaToken() == null || request.getRecaptchaToken().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "reCAPTCHA verification failed. Please complete the captcha."));
            }
            try {
                RestTemplate restTemplate = new RestTemplate();
                String verifyUrl = RECAPTCHA_VERIFY_URL + "?secret=" + recaptchaSecretKey + "&response=" + request.getRecaptchaToken();
                @SuppressWarnings("unchecked")
                Map<String, Object> captchaResponse = restTemplate.postForObject(verifyUrl, null, Map.class);
                boolean captchaSuccess = captchaResponse != null && Boolean.TRUE.equals(captchaResponse.get("success"));
                if (!captchaSuccess) {
                    log.warn("reCAPTCHA verification failed. Response: {}", captchaResponse);
                    return ResponseEntity.badRequest().body(Map.of("error", "reCAPTCHA verification failed. Please try again."));
                }
            } catch (Exception e) {
                log.error("Error verifying reCAPTCHA: {}", e.getMessage());
                return ResponseEntity.internalServerError().body(Map.of("error", "Could not verify reCAPTCHA. Please try again."));
            }
        }

        // 2. Forward the message via email
        try {
            log.info("Processing contact form from '{}' <{}> with subject: '{}'", request.getName(), request.getEmail(), request.getSubject());

            String emailBody = String.format(
                "New Contact Form Submission\n\n" +
                "From Name: %s\n" +
                "From Email: %s\n" +
                "Subject: %s\n\n" +
                "Message:\n%s",
                request.getName(), request.getEmail(), request.getSubject(), request.getMessage()
            );

            // Forward to the author's private email
            mailService.send("noahnganji40@gmail.com", "[AREA Contact] " + request.getSubject(), emailBody);

            // 3. Send a confirmation copy to the sender
            String confirmationBody = String.format(
                "Hi %s,\n\nThank you for reaching out! We have received your message and will get back to you as soon as possible.\n\n" +
                "Here's a copy of your message:\n\nSubject: %s\n\n%s\n\nBest regards,\nThe AREA Team",
                request.getName(), request.getSubject(), request.getMessage()
            );
            mailService.send(request.getEmail(), "We received your message - AREA", confirmationBody);

            return ResponseEntity.ok(Map.of("message", "Your message has been sent successfully! A confirmation has been sent to your email."));
        } catch (Exception e) {
            log.error("Failed to process contact form submission: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send message. Please try again later."));
        }
    }
}
