package org.harsha.backend.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AddItemRequest
 *
 * Request payload received from the client when adding
 * a product to the shopping cart.
 *
 * Contains all the details needed to identify the product,
 * the selected size, quantity, and price at the time of adding.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddItemRequest {

    /** ID of the product to add to the cart */
    private Long productId;

    /** Selected size variant (e.g. "S", "M", "L", "42") */
    private String size;

    /** Number of units to add to the cart */
    private int quantity;

    /** Price of the product at the time of adding */
    private Integer price;
}