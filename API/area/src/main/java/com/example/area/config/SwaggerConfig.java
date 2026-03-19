package com.example.area.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "AREA API",
                version = "1.0",
                description = "Documentation of backend API for AREA automation platform"
        )
)
public class SwaggerConfig {}
