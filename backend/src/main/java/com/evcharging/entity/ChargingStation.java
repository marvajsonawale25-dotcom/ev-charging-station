package com.evcharging.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing an EV Charging Station.
 */
@Entity
@Table(name = "charging_stations")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChargingStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User operator;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String address;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 20)
    private String pincode;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(name = "operating_hours", length = 100)
    private String operatingHours;

    @Column(name = "contact_number", length = 30)
    private String contactNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String amenities;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StationStatus status = StationStatus.ACTIVE;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("station")
    private List<Charger> chargers = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ChargingStation() {}

    public ChargingStation(Long id, User operator, String name, String address, String city, String pincode, Double latitude, Double longitude, String operatingHours, String contactNumber, String description, String amenities, StationStatus status, List<Charger> chargers, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.operator = operator;
        this.name = name;
        this.address = address;
        this.city = city;
        this.pincode = pincode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.operatingHours = operatingHours;
        this.contactNumber = contactNumber;
        this.description = description;
        this.amenities = amenities;
        this.status = status != null ? status : StationStatus.ACTIVE;
        this.chargers = chargers != null ? chargers : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private User operator;
        private String name;
        private String address;
        private String city;
        private String pincode;
        private Double latitude;
        private Double longitude;
        private String operatingHours;
        private String contactNumber;
        private String description;
        private String amenities;
        private StationStatus status = StationStatus.ACTIVE;
        private List<Charger> chargers = new ArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder operator(User operator) { this.operator = operator; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder address(String address) { this.address = address; return this; }
        public Builder city(String city) { this.city = city; return this; }
        public Builder pincode(String pincode) { this.pincode = pincode; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder operatingHours(String operatingHours) { this.operatingHours = operatingHours; return this; }
        public Builder contactNumber(String contactNumber) { this.contactNumber = contactNumber; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder amenities(String amenities) { this.amenities = amenities; return this; }
        public Builder status(StationStatus status) { this.status = status; return this; }
        public Builder chargers(List<Charger> chargers) { this.chargers = chargers; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ChargingStation build() {
            return new ChargingStation(id, operator, name, address, city, pincode, latitude, longitude, operatingHours, contactNumber, description, amenities, status, chargers, createdAt, updatedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getOperator() { return operator; }
    public void setOperator(User operator) { this.operator = operator; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

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

    public List<Charger> getChargers() { return chargers; }
    public void setChargers(List<Charger> chargers) { this.chargers = chargers; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
