package com.example.area.controller;

import com.example.area.config.ServiceRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AboutControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void aboutJsonReturnsValidStructure() throws Exception {
        mockMvc.perform(get("/about.json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.client").exists())
                .andExpect(jsonPath("$.client.host").exists())
                .andExpect(jsonPath("$.server").exists())
                .andExpect(jsonPath("$.server.current_time").isNumber())
                .andExpect(jsonPath("$.server.services").isArray());
    }

    @Test
    void aboutJsonContainsAllServices() throws Exception {
        mockMvc.perform(get("/about.json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.server.services", hasSize(3)))
                .andExpect(jsonPath("$.server.services[?(@.name == 'timer')]").exists())
                .andExpect(jsonPath("$.server.services[?(@.name == 'mail')]").exists())
                .andExpect(jsonPath("$.server.services[?(@.name == 'github')]").exists());
    }

    @Test
    void aboutJsonServicesHaveActionsAndReactions() throws Exception {
        mockMvc.perform(get("/about.json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.server.services[?(@.name == 'timer')].actions").exists())
                .andExpect(jsonPath("$.server.services[?(@.name == 'mail')].reactions").exists())
                .andExpect(jsonPath("$.server.services[?(@.name == 'github')].actions").exists())
                .andExpect(jsonPath("$.server.services[?(@.name == 'github')].reactions").exists());
    }
}
