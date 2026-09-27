package com.evcharging.dto;

import com.evcharging.entity.ConnectorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class VehicleRequest {
    @NotBlank(message = "Model name is required")
    private String modelName;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotNull(message = "Battery capacity is required")
    @Positive(message = "Battery capacity must be greater than 0")
    private Double batteryCapacityKwh;

    @NotNull(message = "Connector type is required")
    private ConnectorType connectorType;

    public VehicleRequest() {}

    public VehicleRequest(String modelName, String registrationNumber, Double batteryCapacityKwh, ConnectorType connectorType) {
        this.modelName = modelName;
        this.registrationNumber = registrationNumber;
        this.batteryCapacityKwh = batteryCapacityKwh;
        this.connectorType = connectorType;
    }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public Double getBatteryCapacityKwh() { return batteryCapacityKwh; }
    public void setBatteryCapacityKwh(Double batteryCapacityKwh) { this.batteryCapacityKwh = batteryCapacityKwh; }

    public ConnectorType getConnectorType() { return connectorType; }
    public void setConnectorType(ConnectorType connectorType) { this.connectorType = connectorType; }
}
