package com.evcharging.controller;

import com.evcharging.entity.ChargingSession;
import com.evcharging.entity.User;
import com.evcharging.repository.ChargingSessionRepository;
import com.evcharging.service.AuthService;
import com.evcharging.service.ChargingSessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class ChargingSessionController {

    private final ChargingSessionService sessionService;
    private final AuthService authService;
    private final ChargingSessionRepository sessionRepository;

    public ChargingSessionController(ChargingSessionService sessionService, AuthService authService, ChargingSessionRepository sessionRepository) {
        this.sessionService = sessionService;
        this.authService = authService;
        this.sessionRepository = sessionRepository;
    }

    @PostMapping("/start/{bookingId}")
    public ResponseEntity<ChargingSession> startSession(@PathVariable Long bookingId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        ChargingSession session = sessionService.startSession(bookingId, currentUser);
        return new ResponseEntity<>(session, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChargingSession> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSession(id));
    }

    @PostMapping("/{id}/simulate-tick")
    public ResponseEntity<ChargingSession> simulateTick(
            @PathVariable Long id,
            @RequestParam(defaultValue = "10") int minutes) {
        return ResponseEntity.ok(sessionService.simulateTick(id, minutes));
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<ChargingSession> stopSession(@PathVariable Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        ChargingSession session = sessionService.stopSession(id, currentUser);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/active")
    public ResponseEntity<ChargingSession> getActiveSession() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return sessionService.getActiveSessionForUser(currentUser.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/my")
    public ResponseEntity<List<ChargingSession>> getMySessions() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(sessionService.getUserSessions(currentUser.getId()));
    }

    @GetMapping("/station/{stationId}")
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<List<ChargingSession>> getStationSessions(@PathVariable Long stationId) {
        return ResponseEntity.ok(sessionService.getStationSessions(stationId));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<ChargingSession>> getAllSessions() {
        return ResponseEntity.ok(sessionRepository.findAll());
    }
}
