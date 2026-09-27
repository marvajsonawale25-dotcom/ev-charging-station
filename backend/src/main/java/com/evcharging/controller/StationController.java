package com.evcharging.controller;

import com.evcharging.dto.StationRequest;
import com.evcharging.dto.StationResponseDto;
import com.evcharging.entity.ChargingStation;
import com.evcharging.entity.StationStatus;
import com.evcharging.entity.User;
import com.evcharging.service.AuthService;
import com.evcharging.service.StationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationService stationService;
    private final AuthService authService;
    private final com.evcharging.service.ChargerService chargerService;

    public StationController(StationService stationService, AuthService authService, com.evcharging.service.ChargerService chargerService) {
        this.stationService = stationService;
        this.authService = authService;
        this.chargerService = chargerService;
    }

    @GetMapping
    public ResponseEntity<List<StationResponseDto>> getAllStations(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) StationStatus status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(stationService.getAllStations(city, status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StationResponseDto> getStationById(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.getStationDtoById(id));
    }

    @GetMapping("/{id}/chargers")
    public ResponseEntity<List<com.evcharging.entity.Charger>> getStationChargers(@PathVariable Long id) {
        return ResponseEntity.ok(chargerService.getChargersByStationId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<ChargingStation> createStation(@Valid @RequestBody StationRequest request) {
        User operator = authService.getCurrentAuthenticatedUser();
        ChargingStation station = stationService.createStation(request, operator);
        return new ResponseEntity<>(station, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<ChargingStation> updateStation(@PathVariable Long id, @Valid @RequestBody StationRequest request) {
        ChargingStation updated = stationService.updateStation(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteStation(@PathVariable Long id) {
        stationService.deleteStation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/operator/my")
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<List<ChargingStation>> getMyStations() {
        User operator = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(stationService.getStationsByOperatorId(operator.getId()));
    }
}
