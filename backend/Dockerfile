# Multi-stage Docker build for Spring Boot application on Render
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy Maven Wrapper and POM
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw

# Copy source code and package executable JAR
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# Production runtime image using Java 17 JRE
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create non-root application user
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

COPY --from=build --chown=spring:spring /app/target/ev-charging-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
