package org.harsha.backend.repository;

import org.harsha.backend.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * AddressRepository
 *
 * Data access layer for the Address entity.
 * Extends JpaRepository to inherit standard CRUD operations
 * (save, findById, findAll, delete, etc.) out of the box.
 *
 * Spring Data JPA automatically generates the implementation
 * at runtime — no custom queries needed for basic operations.
 */
public interface AddressRepository extends JpaRepository<Address, Long> {

}