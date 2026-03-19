package com.example.area;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AreaApplication {

	public static void main(String[] args) {
		SpringApplication.run(AreaApplication.class, args);
	}

}
