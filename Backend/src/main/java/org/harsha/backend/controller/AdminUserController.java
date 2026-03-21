package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.User;
import org.harsha.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * AdminUserController
 *
 * Handles admin-level user management endpoints.
 * All routes are protected under /api/admin and
 * require authentication with admin privileges.
 *
 * Responsibilities:
 * - Retrieve all registered users in the system
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    /**
     * Retrieves all registered users in the system.
     * Intended for admin dashboards and user management views.
     *
     * @param jwt Authorization header for admin verification
     * @return list of all User entities
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestHeader("Authorization") String jwt) throws UserException {

        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }
}