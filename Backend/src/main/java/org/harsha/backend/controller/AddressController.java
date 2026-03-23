package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.Address;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.AddressRepository;
import org.harsha.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressRepository addressRepository;
    private final UserService userService;

    // --- 1. THE SOFT DELETE ---
    @DeleteMapping("/{addressId}")
    public ResponseEntity<String> deleteAddress(
            @PathVariable Long addressId,
            @RequestHeader("Authorization") String jwt) throws UserException {

        User user = userService.findUserProfileByJwt(jwt);

        // Find the address
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new UserException("Address not found"));

        // Verify the address belongs to this user
        if (address.getUser() != null && address.getUser().getId().equals(user.getId())) {
            // SOFT DELETE: We set the user to null so it disappears from their profile,
            // but stays in the DB so old Orders don't crash!
            address.setUser(null);
            addressRepository.save(address);
            return ResponseEntity.ok("Address removed from profile");
        }

        throw new UserException("You can only delete your own addresses");
    }

    // --- 2. THE UPDATE ENDPOINT ---
    @PutMapping("/{addressId}")
    public ResponseEntity<Address> updateAddress(
            @PathVariable Long addressId,
            @RequestBody Address req,
            @RequestHeader("Authorization") String jwt) throws UserException {

        User user = userService.findUserProfileByJwt(jwt);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new UserException("Address not found"));

        // Verify the address belongs to this user before updating
        if (address.getUser() != null && address.getUser().getId().equals(user.getId())) {
            address.setFirstName(req.getFirstName());
            address.setLastName(req.getLastName());
            address.setStreetAddress(req.getStreetAddress());
            address.setCity(req.getCity());
            address.setState(req.getState());
            address.setZipCode(req.getZipCode());
            address.setMobile(req.getMobile());

            return ResponseEntity.ok(addressRepository.save(address));
        }

        throw new UserException("You can only update your own addresses");
    }
}