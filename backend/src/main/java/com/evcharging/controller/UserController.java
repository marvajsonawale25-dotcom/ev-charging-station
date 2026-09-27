package com.evcharging.controller;

import com.evcharging.dto.UserDto;
import com.evcharging.entity.Role;
import com.evcharging.entity.User;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.UserRepository;
import com.evcharging.service.AuthService;
import com.evcharging.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final BookingService bookingService;

    public UserController(UserRepository userRepository, AuthService authService, BookingService bookingService) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.bookingService = bookingService;
    }

    @GetMapping("/users/profile")
    public ResponseEntity<UserDto> getProfile() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(toDto(user));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/admin/users/{id}/role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    @Transactional
    @PutMapping({"/admin/users/{id}/status", "/users/{id}/status"})
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        boolean targetStatus = (active != null) ? active : !user.isActive();
        user.setActive(targetStatus);
        userRepository.save(user);

        if (!targetStatus && user.getRole() == Role.ROLE_OPERATOR) {
            bookingService.cancelFutureBookingsForOperator(user.getId());
        }

        return ResponseEntity.ok(toDto(user));
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
