package com.example.area.controller;

import com.example.area.entity.TimerAction;
import com.example.area.service.TimerActionService;
import com.example.area.v1.DTOs.timer.CreateTimerActionRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/timer")
public class TimerController {

    private final TimerActionService timerActionService;

    public TimerController(TimerActionService timerActionService) {
        this.timerActionService = timerActionService;
    }

    @PostMapping("/actions/time-at")
    public ResponseEntity<?> createTimerAction(
            @RequestBody CreateTimerActionRequest request,
            Authentication authentication
    ) {

        String email = (String) authentication.getPrincipal();

        TimerAction action =
                timerActionService.createTimerWithEmail(email, request);

        return ResponseEntity.ok(Map.of(
                "id", action.getId(),
                "time", action.getTargetTime().toString()
        ));
    }
}
