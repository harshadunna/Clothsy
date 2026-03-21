package org.harsha.backend.controller;

import org.harsha.backend.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HomeController
 *
 * Handles the root endpoint of the application.
 * Serves as a health check to confirm the API is running.
 */
@RestController
public class HomeController {

    /**
     * Root endpoint — confirms the API is up and running.
     *
     * @return welcome message and success status
     */
    @GetMapping("/")
    public ResponseEntity<ApiResponse> home() {

        return ResponseEntity.ok(new ApiResponse("Welcome To E-Commerce System", true));
    }
}