package com.mindmentor.backend.controller;

import com.mindmentor.backend.dto.user.ProfileResponse;
import com.mindmentor.backend.dto.user.UpdateProfileRequest;
import com.mindmentor.backend.service.UserService;
import com.mindmentor.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User Profile")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile(SecurityUtil.currentUserId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(SecurityUtil.currentUserId(), request));
    }
}
