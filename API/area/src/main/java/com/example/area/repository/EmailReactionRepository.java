package com.example.area.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.area.entity.EmailReaction;
import com.example.area.entity.TimerAction;

public interface EmailReactionRepository
        extends JpaRepository<EmailReaction, Long> {

    List<EmailReaction> findByTimerAction(TimerAction action);
}
