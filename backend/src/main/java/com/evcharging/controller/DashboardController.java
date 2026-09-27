package com.evcharging.controller;

import com.evcharging.dto.AdminDashboardStats;
import com.evcharging.dto.CustomerDashboardStats;
import com.evcharging.dto.OperatorDashboardStats;
import com.evcharging.entity.User;
import com.evcharging.service.AuthService;
import com.evcharging.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuthService authService;

    public DashboardController(DashboardService dashboardService, AuthService authService) {
        this.dashboardService = dashboardService;
        this.authService = authService;
    }

    @GetMapping("/customer")
    public ResponseEntity<CustomerDashboardStats> getCustomerDashboard() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(dashboardService.getCustomerDashboard(currentUser.getId()));
    }

    @GetMapping("/operator")
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<OperatorDashboardStats> getOperatorDashboard() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(dashboardService.getOperatorDashboard(currentUser.getId()));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AdminDashboardStats> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }
}
