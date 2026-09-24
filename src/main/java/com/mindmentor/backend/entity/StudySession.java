package com.mindmentor.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "study_sessions")
public class StudySession {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed
    private String userId;

    /** Duration in seconds. */
    private long duration;

    private Instant startTime;

    private Instant endTime;

    @Builder.Default
    private String mode = "focus";

    @CreatedDate
    private Instant createdAt;
}
