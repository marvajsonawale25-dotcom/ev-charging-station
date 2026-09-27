package com.evcharging.dto;

import com.evcharging.entity.ChargerStatus;
import com.evcharging.entity.ChargerType;
import com.evcharging.entity.ConnectorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ChargerRequest {
    @NotNull(message = "Station ID is required")
    private Long stationId;

    @NotBlank(message = "Identifier is required")
    private String identifier;

    @NotNull(message = "Charger type is required")
    private ChargerType chargerType;

    @NotNull(message = "Connector type is required")
    private ConnectorType connectorType;

    @NotNull(message = "Power rating is required")
    @Positive(message = "Power rating must be greater than 0")
    private Double powerRatingKw;

    @NotNull(message = "Price per kWh is required")
    @Positive(message = "Price must be greater than 0")
    private Double pricePerKwh;

    private ChargerStatus status;

    public ChargerRequest() {}

    public ChargerRequest(Long stationId, String identifier, ChargerType chargerType, ConnectorType connectorType, Double powerRatingKw, Double pricePerKwh, ChargerStatus status) {
        this.stationId = stationId;
        this.identifier = identifier;
        this.chargerType = chargerType;
        this.connectorType = connectorType;
        this.powerRatingKw = powerRatingKw;
        this.pricePerKwh = pricePerKwh;
        this.status = status;
    }

    public Long getStationId() { return stationId; }
    public void setStationId(Long stationId) { this.stationId = stationId; }

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
}
