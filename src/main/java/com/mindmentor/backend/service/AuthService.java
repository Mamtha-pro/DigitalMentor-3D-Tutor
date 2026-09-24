package com.mindmentor.backend.service;

import com.mindmentor.backend.dto.auth.AuthResponse;
import com.mindmentor.backend.dto.auth.LoginRequest;
import com.mindmentor.backend.dto.auth.RegisterRequest;
import com.mindmentor.backend.dto.user.UserResponse;
import com.mindmentor.backend.entity.User;
import com.mindmentor.backend.exception.ApiException;
import com.mindmentor.backend.repository.UserRepository;
import com.mindmentor.backend.security.AppUserDetails;
import com.mindmentor.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("EMAIL_EXISTS", "An account with this email already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();

        User saved = userRepository.save(user);

        String token = jwtService.generateToken(new AppUserDetails(saved), saved.getId());

        return AuthResponse.builder()
                .token(token)
                .user(toResponse(saved))
                .message("Account created successfully")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        } catch (BadCredentialsException ex) {
            throw ApiException.unauthorized("Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        String token = jwtService.generateToken(new AppUserDetails(user), user.getId());

        return AuthResponse.builder()
                .token(token)
                .user(toResponse(user))
                .message("Signed in successfully")
                .build();
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}
