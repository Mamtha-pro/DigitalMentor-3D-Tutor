package com.mindmentor.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "curated_resources")
public class ResourceGroup {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed
    private String userId;

    private String topic;

    @Builder.Default
    private List<ResourceItem> resources = new ArrayList<>();

    private Instant lastUpdated;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceItem {
        private String title;
        private String url;
        private String description;
        private String type; // article | video | course | docs, etc.
        private String source;
    }
}
