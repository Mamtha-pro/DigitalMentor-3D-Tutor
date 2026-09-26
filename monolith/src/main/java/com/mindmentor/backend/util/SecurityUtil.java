package com.mindmentor.backend.util;

import com.mindmentor.backend.exception.ApiException;
import com.mindmentor.backend.security.AppUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Convenience accessor for the currently authenticated user, resolved from
 * the JWT that {@link com.mindmentor.backend.security.JwtAuthFilter} placed
 * on the security context.
 */
public final class SecurityUtil {

    private SecurityUtil() {
    }

    public static String currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof AppUserDetails userDetails)) {
            throw ApiException.unauthorized("Authentication is required for this request");
        }

        return userDetails.getId();
    }

    public static String currentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof AppUserDetails userDetails)) {
            throw ApiException.unauthorized("Authentication is required for this request");
        }

        return userDetails.getUsername();
    }
}
