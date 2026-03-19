package com.example.area.repository;

import com.example.area.entity.Area;
import com.example.area.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AreaRepository extends JpaRepository<Area, Long> {

    List<Area> findByUser(User user);
}
