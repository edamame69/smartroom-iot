package com.smartroom;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    public final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public static void require(boolean valid, HttpStatus status, String message) {
        if (!valid) throw new ApiException(status, message);
    }
}
