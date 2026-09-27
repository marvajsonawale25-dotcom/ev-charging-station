package com.evcharging.service;

import com.evcharging.dto.StationRequest;
import com.evcharging.dto.StationResponseDto;
import com.evcharging.entity.ChargingStation;
import com.evcharging.entity.StationStatus;
import com.evcharging.entity.User;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.ChargingStationRepository;
import com.evcharging.repository.ReviewRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.evcharging.entity.Charger;
import com.evcharging.entity.ChargerStatus;
import com.evcharging.entity.ChargerType;
import com.evcharging.entity.ConnectorType;
import com.evcharging.entity.Role;
import com.evcharging.repository.ChargerRepository;
import com.evcharging.repository.UserRepository;

@Service
public class StationService {

    private final ChargingStationRepository stationRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ChargerRepository chargerRepository;

    public StationService(ChargingStationRepository stationRepository,
                          ReviewRepository reviewRepository,
                          UserRepository userRepository,
                          ChargerRepository chargerRepository) {
        this.stationRepository = stationRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.chargerRepository = chargerRepository;
    }

    public List<StationResponseDto> getAllStations(String city, StationStatus status, String search) {
        Specification<ChargingStation> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (city != null && !city.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("city")),
                        city.trim().toLowerCase()
                ));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern);
                Predicate addressMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("address")), pattern);
                predicates.add(criteriaBuilder.or(nameMatch, addressMatch));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        List<ChargingStation> stations = stationRepository.findAll(spec);

        return stations.stream().map(station -> {
            Double avgRating = reviewRepository.getAverageRatingForStation(station.getId());
            int reviewCount = reviewRepository.findByStationIdOrderByCreatedAtDesc(station.getId()).size();
            return StationResponseDto.fromEntity(station, avgRating, reviewCount);
        }).collect(Collectors.toList());
    }

    public StationResponseDto getStationDtoById(Long id) {
        ChargingStation station = getStationById(id);
        Double avgRating = reviewRepository.getAverageRatingForStation(station.getId());
        int reviewCount = reviewRepository.findByStationIdOrderByCreatedAtDesc(station.getId()).size();
        return StationResponseDto.fromEntity(station, avgRating, reviewCount);
    }

    public ChargingStation getStationById(Long id) {
        return stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charging Station not found with ID: " + id));
    }

    public List<ChargingStation> getStationsByOperatorId(Long operatorId) {
        return stationRepository.findByOperatorId(operatorId);
    }

    @Transactional
    public ChargingStation createStation(StationRequest request, User operator) {
        User assignedOperator = operator;
        if (operator.getRole() == Role.ROLE_ADMIN) {
            if (request.getOperatorId() != null) {
                assignedOperator = userRepository.findById(request.getOperatorId()).orElse(operator);
            } else if (request.getOperatorName() != null && !request.getOperatorName().trim().isEmpty()) {
                String targetName = request.getOperatorName().trim();
                List<User> operators = userRepository.findByRole(Role.ROLE_OPERATOR);
                assignedOperator = operators.stream()
                        .filter(u -> u.getName().equalsIgnoreCase(targetName) || u.getName().toLowerCase().contains(targetName.toLowerCase()))
                        .findFirst()
                        .orElse(null);

                if (assignedOperator == null) {
                    // Create an operator user account with this name if not found
                    String emailPrefix = targetName.toLowerCase().replaceAll("[^a-z0-9]", "");
                    if (emailPrefix.isEmpty()) emailPrefix = "operator" + System.currentTimeMillis() % 10000;
                    String genEmail = emailPrefix + "@evhub.in";
                    if (userRepository.existsByEmail(genEmail)) {
                        genEmail = emailPrefix + System.currentTimeMillis() % 1000 + "@evhub.in";
                    }
                    User newOp = User.builder()
                            .name(targetName)
                            .email(genEmail)
                            .password("$2a$10$wT8KzU7vY/mSj6q.J.kL3O9kM3M4Kk9jI8L8J8Kk9jI8L8J8Kk9jI") // bcrypt dummy
                            .phone("+91 98200 00000")
                            .role(Role.ROLE_OPERATOR)
                            .active(true)
                            .build();
                    assignedOperator = userRepository.save(newOp);
                }
            }
        }

        String pin = request.getPincode() != null && !request.getPincode().trim().isEmpty() 
                ? request.getPincode().trim() : "400001";

        ChargingStation station = ChargingStation.builder()
                .operator(assignedOperator)
                .name(request.getName().trim())
                .address(request.getAddress().trim())
                .city(request.getCity().trim())
                .pincode(pin)
                .latitude(request.getLatitude() != null ? request.getLatitude() : 19.0760)
                .longitude(request.getLongitude() != null ? request.getLongitude() : 72.8777)
                .operatingHours(request.getOperatingHours() != null && !request.getOperatingHours().trim().isEmpty() ? request.getOperatingHours().trim() : "24 / 7 Accessible")
                .contactNumber(request.getContactNumber() != null ? request.getContactNumber() : assignedOperator.getPhone())
                .description(request.getDescription())
                .amenities(request.getAmenities() != null && !request.getAmenities().trim().isEmpty() ? request.getAmenities().trim() : "WiFi, EV Parking, Cafe")
                .status(request.getStatus() != null ? request.getStatus() : StationStatus.ACTIVE)
                .build();

        ChargingStation savedStation = stationRepository.save(station);

        if (request.getPricePerKwh() != null && request.getPricePerKwh() > 0) {
            Charger port1 = Charger.builder()
                    .station(savedStation)
                    .identifier("CCS-01")
                    .chargerType(ChargerType.DC_FAST)
                    .connectorType(ConnectorType.CCS2)
                    .powerRatingKw(60.0)
                    .pricePerKwh(request.getPricePerKwh())
                    .status(ChargerStatus.AVAILABLE)
                    .build();
            chargerRepository.save(port1);

            Charger port2 = Charger.builder()
                    .station(savedStation)
                    .identifier("TYPE2-01")
                    .chargerType(ChargerType.AC)
                    .connectorType(ConnectorType.TYPE2)
                    .powerRatingKw(22.0)
                    .pricePerKwh(Math.max(10.0, request.getPricePerKwh() - 3.0))
                    .status(ChargerStatus.AVAILABLE)
                    .build();
            chargerRepository.save(port2);
        }

        return savedStation;
    }

    @Transactional
    public ChargingStation updateStation(Long id, StationRequest request) {
        ChargingStation station = getStationById(id);
        station.setName(request.getName().trim());
        station.setAddress(request.getAddress().trim());
        station.setCity(request.getCity().trim());
        if (request.getPincode() != null) station.setPincode(request.getPincode().trim());
        if (request.getLatitude() != null) station.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) station.setLongitude(request.getLongitude());
        if (request.getOperatingHours() != null) station.setOperatingHours(request.getOperatingHours());
        if (request.getContactNumber() != null) station.setContactNumber(request.getContactNumber());
        if (request.getDescription() != null) station.setDescription(request.getDescription());
        if (request.getAmenities() != null) station.setAmenities(request.getAmenities());
        if (request.getStatus() != null) station.setStatus(request.getStatus());

        return stationRepository.save(station);
    }

    @Transactional
    public void deleteStation(Long id) {
        ChargingStation station = getStationById(id);
        stationRepository.delete(station);
    }
}
