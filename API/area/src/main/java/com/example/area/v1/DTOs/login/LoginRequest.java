package com.example.area.v1.DTOs.login;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
