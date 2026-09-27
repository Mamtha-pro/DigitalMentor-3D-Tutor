package com.mindmentor.resource.controller;

import com.mindmentor.resource.dto.WebSearchRequest;
import com.mindmentor.resource.dto.WebSearchResponse;
import com.mindmentor.resource.service.WebSearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/web-search")
@RequiredArgsConstructor
public class WebSearchController {

    private final WebSearchService webSearchService;

    @PostMapping
    public ResponseEntity<WebSearchResponse> search(
            @Valid @RequestBody WebSearchRequest request) {

        return ResponseEntity.ok(
                webSearchService.search(request.getQuery())
        );
    }
}