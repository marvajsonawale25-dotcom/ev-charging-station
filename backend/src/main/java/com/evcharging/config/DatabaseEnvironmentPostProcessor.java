package com.evcharging.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Pre-processes environment variables before Spring Boot and JPA initialize.
 * Converts Render / cloud URI format (postgresql://USER:PASSWORD@HOST:PORT/DATABASE)
 * into standard JDBC format (jdbc:postgresql://HOST:PORT/DATABASE) and ensures
 * credentials and jakarta.persistence.jdbc.url are explicitly provided.
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DatabaseEnvironmentPostProcessor.class);

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String dbUrl = environment.getProperty("DB_URL");
        String databaseUrl = environment.getProperty("DATABASE_URL");
        String springDsUrl = environment.getProperty("spring.datasource.url");

        String rawUrl = null;
        if (dbUrl != null && isRawPostgresUrl(dbUrl)) {
            rawUrl = dbUrl;
        } else if (databaseUrl != null && isRawPostgresUrl(databaseUrl)) {
            rawUrl = databaseUrl;
        } else if (springDsUrl != null && isRawPostgresUrl(springDsUrl)) {
            rawUrl = springDsUrl;
        }

        if (rawUrl != null) {
            try {
                int slashSlashIndex = rawUrl.indexOf("://");
                int atIndex = rawUrl.lastIndexOf('@');

                String username = null;
                String password = null;
                String jdbcUrl;

                if (atIndex > slashSlashIndex) {
                    String userInfo = rawUrl.substring(slashSlashIndex + 3, atIndex);
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    if (parts.length > 1) {
                        password = parts[1];
                    }
                    jdbcUrl = "jdbc:postgresql://" + rawUrl.substring(atIndex + 1);
                } else {
                    jdbcUrl = "jdbc:postgresql://" + rawUrl.substring(slashSlashIndex + 3);
                }

                Map<String, Object> overrideProps = new HashMap<>();
                overrideProps.put("spring.datasource.url", jdbcUrl);
                overrideProps.put("jakarta.persistence.jdbc.url", jdbcUrl);

                if (username != null && !username.isBlank()) {
                    String currentUsername = environment.getProperty("spring.datasource.username");
                    if (currentUsername == null || currentUsername.isBlank() || "postgres".equals(currentUsername)) {
                        overrideProps.put("spring.datasource.username", username);
                        overrideProps.put("jakarta.persistence.jdbc.user", username);
                    }
                }

                if (password != null && !password.isBlank()) {
                    String currentPassword = environment.getProperty("spring.datasource.password");
                    if (currentPassword == null || currentPassword.isBlank()) {
                        overrideProps.put("spring.datasource.password", password);
                        overrideProps.put("jakarta.persistence.jdbc.password", password);
                    }
                }

                environment.getPropertySources().addFirst(new MapPropertySource("renderDatabaseOverride", overrideProps));
                log.info("DatabaseEnvironmentPostProcessor: Normalized PostgreSQL URL to '{}'", jdbcUrl);
            } catch (Exception e) {
                log.warn("DatabaseEnvironmentPostProcessor: Could not parse database URL: {}", e.getMessage());
            }
        }
    }

    private boolean isRawPostgresUrl(String url) {
        return url.startsWith("postgres://") || url.startsWith("postgresql://");
    }
}
