package com.evcharging;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for the EV Charging Station Management and Booking Platform.
 * 
 * Academic Project - Mini Project (Java / Spring Boot + React + PostgreSQL)
 */
@SpringBootApplication
@EnableScheduling
public class EvChargingApplication {

    public static void main(String[] args) {
        SpringApplication.run(EvChargingApplication.class, args);
    }
}
