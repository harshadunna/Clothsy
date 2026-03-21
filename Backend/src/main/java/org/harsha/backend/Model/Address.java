package org.harsha.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Address Entity
 *
 * Represents a physical address associated with a user.
 * Maps to the "addresses" table in the database.
 *
 * Used for shipping and billing purposes during checkout.
 * Each address belongs to exactly one user (Many-to-One),
 * and a user can have multiple addresses (One-to-Many on the User side).
 */
@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    /** Auto-incremented primary key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String streetAddress;
    private String city;
    private String state;
    private String zipCode;
    private String mobile;

    /**
     * The user this address belongs to.
     * Excluded from JSON serialization to prevent circular references
     * (User → Address → User → ...).
     */
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}
