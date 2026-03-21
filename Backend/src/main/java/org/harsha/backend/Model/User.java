package org.harsha.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * User Entity
 *
 * Represents a registered customer in the system.
 * Maps to the "users" table in the database.
 *
 * Relationships:
 * - One user can have multiple addresses (shipping/billing)
 * - One user can leave multiple ratings on products
 * - One user can write multiple reviews on products
 *
 * Ratings and Reviews are hidden from API responses (@JsonIgnore)
 * to avoid circular references and reduce payload size.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    /** Auto-incremented primary key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    /** BCrypt-hashed password — never stored as plain text */
    @Column(name = "password")
    private String password;

    /** Unique email address — used as the login identifier */
    @Column(name = "email", unique = true)
    private String email;

    /**
     * User's role in the system (e.g. "ROLE_USER", "ROLE_ADMIN").
     * Stored as a plain string for simplicity and flexibility.
     */
    private String role;

    private String mobile;

    /**
     * List of addresses associated with this user.
     * Cascade ALL ensures addresses are saved/deleted with the user.
     * orphanRemoval cleans up addresses no longer linked to this user.
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses = new ArrayList<>();

    /**
     * Product ratings submitted by this user.
     * Excluded from JSON serialization to prevent circular references.
     */
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Rating> ratings = new ArrayList<>();

    /**
     * Product reviews written by this user.
     * Excluded from JSON serialization to prevent circular references.
     */
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    /** Timestamp of when this user account was created */
    private LocalDateTime createdAt;
}