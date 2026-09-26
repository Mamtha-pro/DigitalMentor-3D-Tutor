package com.mindmentor.backend.service;

import com.mindmentor.backend.dto.user.ProfileResponse;
import com.mindmentor.backend.dto.user.UpdateProfileRequest;
import com.mindmentor.backend.dto.user.UserResponse;
import com.mindmentor.backend.entity.User;
import com.mindmentor.backend.exception.ApiException;
import com.mindmentor.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public ProfileResponse getProfile(String userId) {
        User user = findUserOrThrow(userId);
        return ProfileResponse.builder().user(toResponse(user)).build();
    }

    public ProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = findUserOrThrow(userId);

        user.setName(request.getName().trim());

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();

            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw ApiException.conflict("EMAIL_EXISTS", "An account with this email already exists");
            }

            user.setEmail(newEmail);
        }

        User saved = userRepository.save(user);

        return ProfileResponse.builder()
                .user(toResponse(saved))
                .message("Profile updated successfully")
                .build();
    }

    private User findUserOrThrow(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}
