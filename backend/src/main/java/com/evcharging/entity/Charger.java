package com.evcharging.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing an individual EV Charger / Point within a Charging Station.
 */
@Entity
@Table(name = "chargers")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Charger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @JsonIgnoreProperties({"chargers", "hibernateLazyInitializer", "handler"})
    private ChargingStation station;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String identifier;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "charger_type", nullable = false, length = 30)
    private ChargerType chargerType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "connector_type", nullable = false, length = 30)
    private ConnectorType connectorType;

    @NotNull
    @Positive
    @Column(name = "power_rating_kw", nullable = false)
    private Double powerRatingKw;

    @NotNull
    @Positive
    @Column(name = "price_per_kwh", nullable = false)
    private Double pricePerKwh;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ChargerStatus status = ChargerStatus.AVAILABLE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Charger() {}

    public Charger(Long id, ChargingStation station, String identifier, ChargerType chargerType, ConnectorType connectorType, Double powerRatingKw, Double pricePerKwh, ChargerStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.station = station;
        this.identifier = identifier;
        this.chargerType = chargerType;
        this.connectorType = connectorType;
        this.powerRatingKw = powerRatingKw;
        this.pricePerKwh = pricePerKwh;
        this.status = status != null ? status : ChargerStatus.AVAILABLE;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private ChargingStation station;
        private String identifier;
        private ChargerType chargerType;
        private ConnectorType connectorType;
        private Double powerRatingKw;
        private Double pricePerKwh;
        private ChargerStatus status = ChargerStatus.AVAILABLE;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder station(ChargingStation station) { this.station = station; return this; }
        public Builder identifier(String identifier) { this.identifier = identifier; return this; }
        public Builder chargerType(ChargerType chargerType) { this.chargerType = chargerType; return this; }
        public Builder connectorType(ConnectorType connectorType) { this.connectorType = connectorType; return this; }
        public Builder powerRatingKw(Double powerRatingKw) { this.powerRatingKw = powerRatingKw; return this; }
        public Builder pricePerKwh(Double pricePerKwh) { this.pricePerKwh = pricePerKwh; return this; }
        public Builder status(ChargerStatus status) { this.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Charger build() {
            return new Charger(id, station, identifier, chargerType, connectorType, powerRatingKw, pricePerKwh, status, createdAt, updatedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ChargingStation getStation() { return station; }
    public void setStation(ChargingStation station) { this.station = station; }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public ChargerType getChargerType() { return chargerType; }
    public void setChargerType(ChargerType chargerType) { this.chargerType = chargerType; }

    public ConnectorType getConnectorType() { return connectorType; }
    public void setConnectorType(ConnectorType connectorType) { this.connectorType = connectorType; }

    public Double getPowerRatingKw() { return powerRatingKw; }
    public void setPowerRatingKw(Double powerRatingKw) { this.powerRatingKw = powerRatingKw; }

    public Double getPricePerKwh() { return pricePerKwh; }
    public void setPricePerKwh(Double pricePerKwh) { this.pricePerKwh = pricePerKwh; }

    public ChargerStatus getStatus() { return status; }
    public void setStatus(ChargerStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
