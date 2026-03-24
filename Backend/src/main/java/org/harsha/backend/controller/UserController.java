package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.Address;
import org.harsha.backend.model.User;
import org.harsha.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(
            @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        return ResponseEntity.ok(user);
    }

    /**
     * Saves a new address for the authenticated user and returns it with its ID.
     */
    @PostMapping("/addresses")
    public ResponseEntity<Address> addAddress(
            @RequestBody Address address,
            @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        Address saved = userService.addAddress(user, address);
        return ResponseEntity.ok(saved);
    }
}