package com.mindmentor.resource.controller;

import com.mindmentor.resource.dto.CurateResourcesRequest;
import com.mindmentor.resource.entity.ResourceGroup;
import com.mindmentor.resource.service.ResourceService;
import com.mindmentor.resource.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Deliberately mounted outside /api to match the paths the Mind Mentor
 * frontend already calls: /curate-resources and /web-search.
 */
@RestController
@RequestMapping("/curate-resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> listResources(
            @PathVariable String userId) {

        List<ResourceGroup> resources =
                resourceService.listResources(
                        SecurityUtil.currentUserId()
                );

        return ResponseEntity.ok(
                Map.of("resources", resources)
        );
    }

    @PostMapping
    public ResponseEntity<ResourceGroup> curateResources(
            @Valid @RequestBody CurateResourcesRequest request) {

        ResourceGroup group =
                resourceService.curateResources(
                        SecurityUtil.currentUserId(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(group);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResources(
            @PathVariable String id) {

        resourceService.deleteResources(
                SecurityUtil.currentUserId(),
                id
        );

        return ResponseEntity.noContent().build();
    }
}