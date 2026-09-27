package com.evcharging.controller;

import com.evcharging.dto.ChargerRequest;
import com.evcharging.entity.Charger;
import com.evcharging.entity.ChargerStatus;
import com.evcharging.service.ChargerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chargers")
public class ChargerController {

    private final ChargerService chargerService;
    private final com.evcharging.service.AuthService authService;

    public ChargerController(ChargerService chargerService, com.evcharging.service.AuthService authService) {
        this.chargerService = chargerService;
        this.authService = authService;
    }

    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<Charger>> getChargersByStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(chargerService.getChargersByStationId(stationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Charger> getChargerById(@PathVariable Long id) {
        return ResponseEntity.ok(chargerService.getChargerById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<Charger> addCharger(@Valid @RequestBody ChargerRequest request) {
        com.evcharging.entity.User currentUser = authService.getCurrentAuthenticatedUser();
        Charger charger = chargerService.addCharger(request, currentUser);
        return new ResponseEntity<>(charger, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<Charger> updateStatus(@PathVariable Long id, @RequestParam ChargerStatus status) {
        com.evcharging.entity.User currentUser = authService.getCurrentAuthenticatedUser();
        Charger charger = chargerService.updateChargerStatus(id, status, currentUser);
        return ResponseEntity.ok(charger);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<Void> deleteCharger(@PathVariable Long id) {
        com.evcharging.entity.User currentUser = authService.getCurrentAuthenticatedUser();
        chargerService.deleteCharger(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
