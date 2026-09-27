package com.evcharging.dto;

import com.evcharging.entity.StationStatus;
import jakarta.validation.constraints.NotBlank;

public class StationRequest {
    @NotBlank(message = "Station name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String pincode;
    private Long operatorId;
    private String operatorName;
    private Double pricePerKwh;
    private Double latitude;
    private Double longitude;
    private String operatingHours;
    private String contactNumber;
    private String description;
    private String amenities;
    private StationStatus status;

    public StationRequest() {}

    public StationRequest(String name, String address, String city, String pincode, Long operatorId, String operatorName, Double pricePerKwh, Double latitude, Double longitude, String operatingHours, String contactNumber, String description, String amenities, StationStatus status) {
        this.name = name;
        this.address = address;
        this.city = city;
        this.pincode = pincode;
        this.operatorId = operatorId;
        this.operatorName = operatorName;
        this.pricePerKwh = pricePerKwh;
        this.latitude = latitude;
        this.longitude = longitude;
        this.operatingHours = operatingHours;
        this.contactNumber = contactNumber;
        this.description = description;
        this.amenities = amenities;
        this.status = status;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public Long getOperatorId() { return operatorId; }
    public void setOperatorId(Long operatorId) { this.operatorId = operatorId; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public Double getPricePerKwh() { return pricePerKwh; }
    public void setPricePerKwh(Double pricePerKwh) { this.pricePerKwh = pricePerKwh; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public StationStatus getStatus() { return status; }
    public void setStatus(StationStatus status) { this.status = status; }
}
