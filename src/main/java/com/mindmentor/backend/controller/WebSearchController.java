package com.mindmentor.backend.controller;

import com.mindmentor.backend.dto.resource.WebSearchRequest;
import com.mindmentor.backend.dto.resource.WebSearchResponse;
import com.mindmentor.backend.service.WebSearchService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Web Search")
@RestController
@RequestMapping("/web-search")
@RequiredArgsConstructor
public class WebSearchController {

    private final WebSearchService webSearchService;

    @PostMapping
    public ResponseEntity<WebSearchResponse> search(@Valid @RequestBody WebSearchRequest request) {
        return ResponseEntity.ok(webSearchService.search(request.getQuery()));
    }
}
