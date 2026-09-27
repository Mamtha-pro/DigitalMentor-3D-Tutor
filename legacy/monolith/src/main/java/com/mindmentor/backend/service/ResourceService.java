package com.mindmentor.backend.service;

import com.mindmentor.backend.dto.resource.CurateResourcesRequest;
import com.mindmentor.backend.entity.ResourceGroup;
import com.mindmentor.backend.exception.ApiException;
import com.mindmentor.backend.repository.ResourceGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Curates a starter set of learning resources for a subject. In production
 * this can be swapped to call a real search/LLM provider; the shape returned
 * to the frontend (topic + resources[]) stays the same either way.
 */
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceGroupRepository resourceGroupRepository;

    public List<ResourceGroup> listResources(String userId) {
        return resourceGroupRepository.findByUserIdOrderByLastUpdatedDesc(userId);
    }

    public ResourceGroup curateResources(String userId, CurateResourcesRequest request) {
        String subject = request.getSubject().trim();

        resourceGroupRepository.findByUserIdAndTopicIgnoreCase(userId, subject)
                .ifPresent(existing -> {
                    throw ApiException.conflict(
                            "RESOURCE_EXISTS",
                            "Resources for this subject already exist. Please check the existing resources.");
                });

        ResourceGroup group = ResourceGroup.builder()
                .userId(userId)
                .topic(subject)
                .resources(buildStarterResources(subject))
                .lastUpdated(Instant.now())
                .build();

        return resourceGroupRepository.save(group);
    }

    public void deleteResources(String userId, String resourceId) {
        ResourceGroup group = resourceGroupRepository.findByIdAndUserId(resourceId, userId)
                .orElseThrow(() -> ApiException.notFound("Resource group not found"));

        resourceGroupRepository.delete(group);
    }

    private List<ResourceGroup.ResourceItem> buildStarterResources(String subject) {
        return List.of(
                ResourceGroup.ResourceItem.builder()
                        .title(subject + " - Wikipedia overview")
                        .url("https://en.wikipedia.org/wiki/Special:Search?search=" + encode(subject))
                        .description("Broad, reliable overview and background reading on " + subject + ".")
                        .type("article")
                        .source("Wikipedia")
                        .build(),
                ResourceGroup.ResourceItem.builder()
                        .title(subject + " video lessons")
                        .url("https://www.youtube.com/results?search_query=" + encode(subject + " tutorial"))
                        .description("Curated video tutorials to build visual and step-by-step intuition for " + subject + ".")
                        .type("video")
                        .source("YouTube")
                        .build(),
                ResourceGroup.ResourceItem.builder()
                        .title(subject + " practice problems")
                        .url("https://www.khanacademy.org/search?search_again=1&page_search_query=" + encode(subject))
                        .description("Practice exercises and worked examples to reinforce " + subject + ".")
                        .type("course")
                        .source("Khan Academy")
                        .build(),
                ResourceGroup.ResourceItem.builder()
                        .title(subject + " community discussion")
                        .url("https://www.reddit.com/search/?q=" + encode(subject))
                        .description("Discussion threads and study tips from other learners of " + subject + ".")
                        .type("community")
                        .source("Reddit")
                        .build()
        );
    }

    private String encode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
