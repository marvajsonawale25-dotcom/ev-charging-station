package com.evcharging.dto;

import com.evcharging.entity.Charger;
import com.evcharging.entity.ChargingStation;
import com.evcharging.entity.StationStatus;

import java.util.List;

public class StationResponseDto {
    private Long id;
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
    private StationStatus status;
    private String operatorName;
    private Long operatorId;
    private int totalChargers;
    private int availableChargers;
    private Double minPricePerKwh;
    private Double maxPowerRatingKw;
    private Double averageRating;
    private int reviewCount;
    private List<Charger> chargers;

    public StationResponseDto() {}

    public StationResponseDto(Long id, String name, String address, String city, String pincode, Double latitude, Double longitude, String operatingHours, String contactNumber, String description, String amenities, StationStatus status, String operatorName, Long operatorId, int totalChargers, int availableChargers, Double minPricePerKwh, Double maxPowerRatingKw, Double averageRating, int reviewCount, List<Charger> chargers) {
        this.id = id;
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
        this.status = status;
        this.operatorName = operatorName;
        this.operatorId = operatorId;
        this.totalChargers = totalChargers;
        this.availableChargers = availableChargers;
        this.minPricePerKwh = minPricePerKwh;
        this.maxPowerRatingKw = maxPowerRatingKw;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
        this.chargers = chargers;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
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
        private StationStatus status;
        private String operatorName;
        private Long operatorId;
        private int totalChargers;
        private int availableChargers;
        private Double minPricePerKwh;
        private Double maxPowerRatingKw;
        private Double averageRating;
        private int reviewCount;
        private List<Charger> chargers;

        public Builder id(Long id) { this.id = id; return this; }
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
        public Builder operatorName(String operatorName) { this.operatorName = operatorName; return this; }
        public Builder operatorId(Long operatorId) { this.operatorId = operatorId; return this; }
        public Builder totalChargers(int totalChargers) { this.totalChargers = totalChargers; return this; }
        public Builder availableChargers(int availableChargers) { this.availableChargers = availableChargers; return this; }
        public Builder minPricePerKwh(Double minPricePerKwh) { this.minPricePerKwh = minPricePerKwh; return this; }
        public Builder maxPowerRatingKw(Double maxPowerRatingKw) { this.maxPowerRatingKw = maxPowerRatingKw; return this; }
        public Builder averageRating(Double averageRating) { this.averageRating = averageRating; return this; }
        public Builder reviewCount(int reviewCount) { this.reviewCount = reviewCount; return this; }
        public Builder chargers(List<Charger> chargers) { this.chargers = chargers; return this; }

        public StationResponseDto build() {
            return new StationResponseDto(id, name, address, city, pincode, latitude, longitude, operatingHours, contactNumber, description, amenities, status, operatorName, operatorId, totalChargers, availableChargers, minPricePerKwh, maxPowerRatingKw, averageRating, reviewCount, chargers);
        }
    }

    public static StationResponseDto fromEntity(ChargingStation station, Double avgRating, int reviewCount) {
        List<Charger> chargers = station.getChargers();
        int total = chargers != null ? chargers.size() : 0;
        int available = 0;
        Double minPrice = null;
        Double maxPower = null;

        if (chargers != null) {
            for (Charger c : chargers) {
                if (c.getStatus() == com.evcharging.entity.ChargerStatus.AVAILABLE) {
                    available++;
                }
                if (minPrice == null || c.getPricePerKwh() < minPrice) {
                    minPrice = c.getPricePerKwh();
                }
                if (maxPower == null || c.getPowerRatingKw() > maxPower) {
                    maxPower = c.getPowerRatingKw();
                }
            }
        }

        return StationResponseDto.builder()
                .id(station.getId())
                .name(station.getName())
                .address(station.getAddress())
                .city(station.getCity())
                .pincode(station.getPincode())
                .latitude(station.getLatitude())
                .longitude(station.getLongitude())
                .operatingHours(station.getOperatingHours())
                .contactNumber(station.getContactNumber())
                .description(station.getDescription())
                .amenities(station.getAmenities())
                .status(station.getStatus())
                .operatorName(station.getOperator() != null ? station.getOperator().getName() : "System Managed")
                .operatorId(station.getOperator() != null ? station.getOperator().getId() : null)
                .totalChargers(total)
                .availableChargers(available)
                .minPricePerKwh(minPrice != null ? minPrice : 0.0)
                .maxPowerRatingKw(maxPower != null ? maxPower : 0.0)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount(reviewCount)
                .chargers(chargers)
                .build();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

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

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public Long getOperatorId() { return operatorId; }
    public void setOperatorId(Long operatorId) { this.operatorId = operatorId; }

    public int getTotalChargers() { return totalChargers; }
    public void setTotalChargers(int totalChargers) { this.totalChargers = totalChargers; }

    public int getAvailableChargers() { return availableChargers; }
    public void setAvailableChargers(int availableChargers) { this.availableChargers = availableChargers; }

    public Double getMinPricePerKwh() { return minPricePerKwh; }
    public void setMinPricePerKwh(Double minPricePerKwh) { this.minPricePerKwh = minPricePerKwh; }

    public Double getMaxPowerRatingKw() { return maxPowerRatingKw; }
    public void setMaxPowerRatingKw(Double maxPowerRatingKw) { this.maxPowerRatingKw = maxPowerRatingKw; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }

    public List<Charger> getChargers() { return chargers; }
    public void setChargers(List<Charger> chargers) { this.chargers = chargers; }
}
