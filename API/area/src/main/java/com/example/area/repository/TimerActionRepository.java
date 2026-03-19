package com.example.area.repository;

import com.example.area.entity.TimerAction;
import com.example.area.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimerActionRepository extends JpaRepository<TimerAction, Long> {

    List<TimerAction> findByUser(User user);
}
