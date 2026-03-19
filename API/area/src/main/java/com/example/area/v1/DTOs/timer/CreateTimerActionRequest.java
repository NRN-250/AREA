package com.example.area.v1.DTOs.timer;

import lombok.Data;

@Data
public class CreateTimerActionRequest {
    private String time;
    private String timezone;

    private EmailDto email;

    @Data
    public static class EmailDto {
        private String to;
        private String subject;
        private String body;
    }
}
