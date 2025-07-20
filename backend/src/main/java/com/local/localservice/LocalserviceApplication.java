package com.local.localservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LocalserviceApplication {
	
	private static final Logger logger = LoggerFactory.getLogger(LocalserviceApplication.class);

	public static void main(String[] args) {
		logger.info("Starting LocalService Application...");
		SpringApplication.run(LocalserviceApplication.class, args);
		logger.info("LocalService Application started successfully");
	}
}
