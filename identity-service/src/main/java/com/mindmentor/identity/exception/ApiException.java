package com.mindmentor.identity.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public ApiException(HttpStatus status, String errorCode, String message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public static ApiException notFound(String message) {
        return new ApiException(
                HttpStatus.NOT_FOUND,
                "NOT_FOUND",
                message
        );
    }

    public static ApiException badRequest(String message) {
        return new ApiException(
                HttpStatus.BAD_REQUEST,
                "BAD_REQUEST",
                message
        );
    }

    public static ApiException conflict(String errorCode, String message) {
        return new ApiException(
                HttpStatus.CONFLICT,
                errorCode,
                message
        );
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(
                HttpStatus.UNAUTHORIZED,
                "UNAUTHORIZED",
                message
        );
    }
}