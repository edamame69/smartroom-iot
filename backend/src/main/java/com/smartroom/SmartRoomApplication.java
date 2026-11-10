package com.smartroom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartRoomApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartRoomApplication.class, args);
    }
}
