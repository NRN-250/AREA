package com.example.area.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registerWithValidDataReturnsSuccess() throws Exception {
        String uniqueEmail = "test" + System.currentTimeMillis() + "@example.com";
        String requestBody = String.format("""
                {
                    "email": "%s",
                    "username": "testuser",
                    "password": "password123"
                }
                """, uniqueEmail);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    void registerWithMissingFieldsReturnsBadRequest() throws Exception {
        String requestBody = """
                {
                    "email": "incomplete@example.com"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginWithInvalidCredentialsReturnsBadRequest() throws Exception {
        String requestBody = """
                {
                    "email": "nonexistent@example.com",
                    "password": "wrongpassword"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void googleMobileLoginWithMissingTokenReturnsBadRequest() throws Exception {
        String requestBody = """
                {
                    "accessToken": ""
                }
                """;

        mockMvc.perform(post("/api/auth/google-mobile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("accessToken is required"));
    }
}
