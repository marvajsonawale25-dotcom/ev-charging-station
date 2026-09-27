package com.evcharging.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        String username = properties.getUsername();
        String password = properties.getPassword();

        // Safety fallback: normalize postgres:// or postgresql:// to jdbc:postgresql://
        if (url != null && (url.startsWith("postgres://") || url.startsWith("postgresql://"))) {
            try {
                int slashSlashIndex = url.indexOf("://");
                int atIndex = url.lastIndexOf('@');

                if (atIndex > slashSlashIndex) {
                    String userInfo = url.substring(slashSlashIndex + 3, atIndex);
                    String[] parts = userInfo.split(":", 2);
                    if (username == null || username.isBlank() || "postgres".equals(username)) {
                        username = parts[0];
                    }
                    if ((password == null || password.isBlank()) && parts.length > 1) {
                        password = parts[1];
                    }
                    url = "jdbc:postgresql://" + url.substring(atIndex + 1);
                } else {
                    url = "jdbc:postgresql://" + url.substring(slashSlashIndex + 3);
                }
                log.info("DatabaseConfig: Fallback normalized URL to: {}", url);
            } catch (Exception e) {
                log.warn("DatabaseConfig: Error normalizing URL: {}", e.getMessage());
            }
        }

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName(properties.determineDriverClassName());
        dataSource.setJdbcUrl(url != null ? url : properties.determineUrl());
        dataSource.setUsername(username != null ? username : properties.determineUsername());
        dataSource.setPassword(password != null ? password : properties.determinePassword());

        // Resilient pool settings for cloud database connections
        dataSource.setConnectionTimeout(30000);
        dataSource.setValidationTimeout(5000);
        dataSource.setMaximumPoolSize(10);
        dataSource.setMinimumIdle(2);

        return dataSource;
    }
}
