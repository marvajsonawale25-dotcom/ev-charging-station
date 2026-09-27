package com.evcharging.controller;

import com.evcharging.dto.VehicleRequest;
import com.evcharging.entity.User;
import com.evcharging.entity.Vehicle;
import com.evcharging.service.AuthService;
import com.evcharging.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;
    private final AuthService authService;

    public VehicleController(VehicleService vehicleService, AuthService authService) {
        this.vehicleService = vehicleService;
        this.authService = authService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Vehicle>> getMyVehicles() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vehicleService.getVehiclesByUserId(currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@Valid @RequestBody VehicleRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Vehicle vehicle = vehicleService.createVehicle(request, currentUser);
        return new ResponseEntity<>(vehicle, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        vehicleService.deleteVehicle(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
