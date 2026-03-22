package org.harsha.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * GlobalException
 *
 * Centralized exception handling for the entire application.
 * Intercepts exceptions thrown by any controller and returns
 * a structured, consistent error response to the client.
 *
 * Uses @RestControllerAdvice so all handlers automatically
 * serialize responses to JSON without needing @ResponseBody.
 */
@RestControllerAdvice
public class GlobalException {

    /**
     * Handles user-related exceptions (e.g. user not found, duplicate email).
     */
    @ExceptionHandler(UserException.class)
    public ResponseEntity<ErrorDetails> handleUserException(UserException e, WebRequest req) {
        return buildErrorResponse(e.getMessage(), req, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles product-related exceptions (e.g. product not found).
     */
    @ExceptionHandler(ProductException.class)
    public ResponseEntity<ErrorDetails> handleProductException(ProductException e, WebRequest req) {
        return buildErrorResponse(e.getMessage(), req, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles cart item exceptions (e.g. item not found, unauthorized access).
     */
    @ExceptionHandler(CartItemException.class)
    public ResponseEntity<ErrorDetails> handleCartItemException(CartItemException e, WebRequest req) {
        return buildErrorResponse(e.getMessage(), req, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles order-related exceptions (e.g. order not found, invalid status).
     */
    @ExceptionHandler(OrderException.class)
    public ResponseEntity<ErrorDetails> handleOrderException(OrderException e, WebRequest req) {
        return buildErrorResponse(e.getMessage(), req, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles validation failures on @Valid annotated request bodies.
     * Extracts the first field-level validation error message.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDetails> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        ErrorDetails error = new ErrorDetails(message, "Validation error", LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handles requests to endpoints that don't exist.
     * Returns a clean 404 response with a helpful message.
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoHandlerFoundException(
            NoHandlerFoundException e) {

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Endpoint not found");
        body.put("path", e.getRequestURL());
        body.put("timestamp", LocalDateTime.now());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    /**
     * Fallback handler for any unhandled exceptions.
     * Catches all exceptions not covered by the specific handlers above.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleGenericException(Exception e, WebRequest req) {
        return buildErrorResponse(e.getMessage(), req, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Private helper to build a consistent ErrorDetails response.
     *
     * @param message error message
     * @param req     the web request for extracting description
     * @param status  HTTP status to return
     * @return ResponseEntity wrapping the ErrorDetails payload
     */
    private ResponseEntity<ErrorDetails> buildErrorResponse(
            String message, WebRequest req, HttpStatus status) {

        ErrorDetails error = new ErrorDetails(message, req.getDescription(false), LocalDateTime.now());
        return ResponseEntity.status(status).body(error);
    }
}