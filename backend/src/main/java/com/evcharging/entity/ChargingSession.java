package com.evcharging.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing an EV Charging Session (active or completed).
 */
@Entity
@Table(name = "charging_sessions")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChargingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_reference", nullable = false, unique = true, length = 50)
    private String sessionReference;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Booking booking;

    @NotNull
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 0;

    @Column(name = "initial_battery_percentage", nullable = false)
    private Double initialBatteryPercentage;

    @Column(name = "current_battery_percentage", nullable = false)
    private Double currentBatteryPercentage;

    @Column(name = "energy_consumed_kwh", nullable = false)
    private Double energyConsumedKwh = 0.0;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "charging_status", nullable = false, length = 30)
    private SessionStatus chargingStatus = SessionStatus.ACTIVE;

    @Column(name = "current_cost", nullable = false)
    private Double currentCost = 0.0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public ChargingSession() {}

    public ChargingSession(Long id, String sessionReference, Booking booking, LocalDateTime startTime, LocalDateTime endTime, Integer durationMinutes, Double initialBatteryPercentage, Double currentBatteryPercentage, Double energyConsumedKwh, SessionStatus chargingStatus, Double currentCost, LocalDateTime createdAt) {
        this.id = id;
        this.sessionReference = sessionReference;
        this.booking = booking;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes != null ? durationMinutes : 0;
        this.initialBatteryPercentage = initialBatteryPercentage;
        this.currentBatteryPercentage = currentBatteryPercentage;
        this.energyConsumedKwh = energyConsumedKwh != null ? energyConsumedKwh : 0.0;
        this.chargingStatus = chargingStatus != null ? chargingStatus : SessionStatus.ACTIVE;
        this.currentCost = currentCost != null ? currentCost : 0.0;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String sessionReference;
        private Booking booking;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer durationMinutes = 0;
        private Double initialBatteryPercentage;
        private Double currentBatteryPercentage;
        private Double energyConsumedKwh = 0.0;
        private SessionStatus chargingStatus = SessionStatus.ACTIVE;
        private Double currentCost = 0.0;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder sessionReference(String sessionReference) { this.sessionReference = sessionReference; return this; }
        public Builder booking(Booking booking) { this.booking = booking; return this; }
        public Builder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public Builder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public Builder durationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public Builder initialBatteryPercentage(Double initialBatteryPercentage) { this.initialBatteryPercentage = initialBatteryPercentage; return this; }
        public Builder currentBatteryPercentage(Double currentBatteryPercentage) { this.currentBatteryPercentage = currentBatteryPercentage; return this; }
        public Builder energyConsumedKwh(Double energyConsumedKwh) { this.energyConsumedKwh = energyConsumedKwh; return this; }
        public Builder chargingStatus(SessionStatus chargingStatus) { this.chargingStatus = chargingStatus; return this; }
        public Builder currentCost(Double currentCost) { this.currentCost = currentCost; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ChargingSession build() {
            return new ChargingSession(id, sessionReference, booking, startTime, endTime, durationMinutes, initialBatteryPercentage, currentBatteryPercentage, energyConsumedKwh, chargingStatus, currentCost, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionReference() { return sessionReference; }
    public void setSessionReference(String sessionReference) { this.sessionReference = sessionReference; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Double getInitialBatteryPercentage() { return initialBatteryPercentage; }
    public void setInitialBatteryPercentage(Double initialBatteryPercentage) { this.initialBatteryPercentage = initialBatteryPercentage; }

    public Double getCurrentBatteryPercentage() { return currentBatteryPercentage; }
    public void setCurrentBatteryPercentage(Double currentBatteryPercentage) { this.currentBatteryPercentage = currentBatteryPercentage; }

    public Double getEnergyConsumedKwh() { return energyConsumedKwh; }
    public void setEnergyConsumedKwh(Double energyConsumedKwh) { this.energyConsumedKwh = energyConsumedKwh; }

    public SessionStatus getChargingStatus() { return chargingStatus; }
    public void setChargingStatus(SessionStatus chargingStatus) { this.chargingStatus = chargingStatus; }

    public Double getCurrentCost() { return currentCost; }
    public void setCurrentCost(Double currentCost) { this.currentCost = currentCost; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
