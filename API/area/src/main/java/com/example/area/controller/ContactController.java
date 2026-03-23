package com.example.area.controller;

import com.example.area.dto.ContactRequest;
import com.example.area.service.MailService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);
    private final MailService mailService;

    public ContactController(MailService mailService) {
        this.mailService = mailService;
    }

    @PostMapping
    public ResponseEntity<?> submitContactForm(@Valid @RequestBody ContactRequest request) {
        try {
            log.info("Received contact form submission from: {}", request.getEmail());

            String emailBody = String.format(
                "New Contact Form Submission\n\n" +
                "Name: %s\n" +
                "Email: %s\n" +
                "Subject: %s\n\n" +
                "Message:\n%s",
                request.getName(), request.getEmail(), request.getSubject(), request.getMessage()
            );

            // Forward to the author's email
            mailService.send("noahnganji40@gmail.com", "AREA Contact: " + request.getSubject(), emailBody);

            return ResponseEntity.ok(Map.of("message", "Your message has been sent successfully."));
        } catch (Exception e) {
            log.error("Failed to process contact form: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send message. Please try again later."));
        }
    }
}
