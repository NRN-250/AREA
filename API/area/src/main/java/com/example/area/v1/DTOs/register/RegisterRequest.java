package com.example.area.v1.DTOs.register;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String username;
}
