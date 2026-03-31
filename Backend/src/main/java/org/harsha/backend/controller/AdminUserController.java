package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.User;
import org.harsha.backend.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * AdminUserController
 *
 * Handles admin-level user management endpoints.
 * All routes are protected under /api/admin and
 * require authentication with admin privileges.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    /**
     * Retrieves all registered users in the system.
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestHeader("Authorization") String jwt) throws UserException {

        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Updates a specific user's role (e.g., Promote to Admin or Revoke).
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> roleRequest) throws UserException {
        
        String newRole = roleRequest.get("role");
        User updatedUser = userService.updateUserRole(userId, newRole);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Exports all users as a downloadable CSV file.
     * This is an enterprise feature for admin reporting.
     */
    @GetMapping("/users/export")
    public ResponseEntity<byte[]> exportUsersToCsv(@RequestHeader("Authorization") String jwt) throws UserException {
        List<User> users = userService.findAllUsers();

        StringBuilder csvBuilder = new StringBuilder();
        // 1. Create the CSV Header
        csvBuilder.append("ID,First Name,Last Name,Email,Role,Registration Date\n");

        // 2. Loop through users and format their data
        for (User user : users) {
            csvBuilder.append(user.getId()).append(",");
            csvBuilder.append(escapeCsv(user.getFirstName())).append(",");
            csvBuilder.append(escapeCsv(user.getLastName())).append(",");
            csvBuilder.append(escapeCsv(user.getEmail())).append(",");
            csvBuilder.append(user.getRole() != null ? user.getRole() : "CUSTOMER").append(",");
            csvBuilder.append(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "Unknown").append("\n");
        }

        // 3. Convert string to raw bytes
        byte[] csvBytes = csvBuilder.toString().getBytes(StandardCharsets.UTF_8);

        // 4. Set headers to force a file download in the browser
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=clothsy_client_archive.csv");
        headers.set(HttpHeaders.CONTENT_TYPE, "text/csv");

        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }

    /**
     * Helper method to escape commas in names to prevent CSV format breaking
     */
    private String escapeCsv(String data) {
        if (data == null) return "";
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            return "\"" + data + "\"";
        }
        return data;
    }
}