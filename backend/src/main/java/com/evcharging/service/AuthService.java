package com.evcharging.service;

import com.evcharging.dto.AuthRequest;
import com.evcharging.dto.AuthResponse;
import com.evcharging.dto.RegisterRequest;
import com.evcharging.entity.*;
import com.evcharging.exception.BadRequestException;
import com.evcharging.repository.ChargingStationRepository;
import com.evcharging.repository.ChargerRepository;
import com.evcharging.repository.UserRepository;
import com.evcharging.security.CustomUserDetails;
import com.evcharging.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ChargingStationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       ChargingStationRepository stationRepository,
                       ChargerRepository chargerRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.stationRepository = stationRepository;
        this.chargerRepository = chargerRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        Role userRole = request.getRole() != null ? request.getRole() : Role.ROLE_CUSTOMER;

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(userRole)
                .active(true)
                .build();

        userRepository.save(user);

        if (userRole == Role.ROLE_OPERATOR) {
            String stName = request.getStationName() != null && !request.getStationName().trim().isEmpty()
                    ? request.getStationName().trim()
                    : request.getName().trim() + " EV Station";
            String stAddress = request.getStationAddress() != null && !request.getStationAddress().trim().isEmpty()
                    ? request.getStationAddress().trim()
                    : "Main Highway Hub";
            String stCity = request.getStationCity() != null && !request.getStationCity().trim().isEmpty()
                    ? request.getStationCity().trim()
                    : "Mumbai";
            String stPincode = request.getStationPincode() != null && !request.getStationPincode().trim().isEmpty()
                    ? request.getStationPincode().trim()
                    : "400001";
            Double lat = request.getLatitude() != null ? request.getLatitude() : 19.0760;
            Double lng = request.getLongitude() != null ? request.getLongitude() : 72.8777;
            String opHours = request.getOperatingHours() != null && !request.getOperatingHours().trim().isEmpty()
                    ? request.getOperatingHours().trim()
                    : "24 / 7 Accessible";
            String amenities = request.getAmenities() != null && !request.getAmenities().trim().isEmpty()
                    ? request.getAmenities().trim()
                    : "WiFi, EV Parking, Cafe";

            ChargingStation station = ChargingStation.builder()
                    .name(stName)
                    .address(stAddress)
                    .city(stCity)
                    .pincode(stPincode)
                    .latitude(lat)
                    .longitude(lng)
                    .operatingHours(opHours)
                    .amenities(amenities)
                    .contactNumber(user.getPhone())
                    .status(StationStatus.ACTIVE)
                    .operator(user)
                    .build();

            stationRepository.save(station);

            Charger fastCharger = Charger.builder()
                    .station(station)
                    .identifier("CCS-01")
                    .chargerType(ChargerType.DC_FAST)
                    .connectorType(ConnectorType.CCS2)
                    .powerRatingKw(60.0)
                    .pricePerKwh(18.0)
                    .status(ChargerStatus.AVAILABLE)
                    .build();
            chargerRepository.save(fastCharger);

            Charger standardCharger = Charger.builder()
                    .station(station)
                    .identifier("TYPE2-01")
                    .chargerType(ChargerType.AC)
                    .connectorType(ConnectorType.TYPE2)
                    .powerRatingKw(22.0)
                    .pricePerKwh(15.0)
                    .status(ChargerStatus.AVAILABLE)
                    .build();
            chargerRepository.save(standardCharger);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String roleName = userDetails.getAuthorities().iterator().next().getAuthority();

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getUsername())
                .role(roleName)
                .build();
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new BadRequestException("User is not authenticated");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Authenticated user not found in database"));
    }
}
