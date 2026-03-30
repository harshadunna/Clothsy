package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.User;
import org.harsha.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    /**
     * Updates a specific user's role (e.g., Promote to Admin or Revoke).
     *
     * @param userId ID of the user to update
     * @param roleRequest Map containing the new role string
     * @return the updated User entity
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> roleRequest) throws UserException {
        
        String newRole = roleRequest.get("role");
        User updatedUser = userService.updateUserRole(userId, newRole);
        return ResponseEntity.ok(updatedUser);
    }
}