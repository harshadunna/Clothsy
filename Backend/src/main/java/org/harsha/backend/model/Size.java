package org.harsha.backend.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Size (Embeddable)
 *
 * Represents a size variant of a product (e.g. S, M, L, XL)
 * along with how many units are available for that size.
 *
 * Not a standalone entity — stored in a separate element collection
 * table linked to the Product entity.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Size {

    /** Size label (e.g. "S", "M", "L", "XL", "42") */
    private String name;

    /** Number of units available for this size */
    private int quantity;
}
