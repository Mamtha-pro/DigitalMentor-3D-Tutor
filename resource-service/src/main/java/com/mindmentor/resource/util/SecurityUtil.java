package com.mindmentor.resource.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtil {

    private SecurityUtil() {
    }

    public static String currentUserId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getPrincipal() == null) {

            throw new IllegalStateException(
                    "Authentication is required for this request"
            );
        }

        return authentication.getPrincipal().toString();
    }

    public static String currentUserEmail() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "Authentication is required for this request"
            );
        }

        Object details = authentication.getDetails();

        if (details == null) {
            throw new IllegalStateException(
                    "Authenticated user email is unavailable"
            );
        }

        return details.toString();
    }
}