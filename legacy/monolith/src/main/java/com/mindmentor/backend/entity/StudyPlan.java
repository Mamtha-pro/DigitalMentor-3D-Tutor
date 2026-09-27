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
@Document(collection = "study_plans")
public class StudyPlan {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed
    private String userId;

    private Overview overview;

    @Builder.Default
    private List<WeeklyPlan> weeklyPlans = new ArrayList<>();

    @Builder.Default
    private List<String> recommendations = new ArrayList<>();

    @JsonProperty("isActive")
    @Builder.Default
    private boolean isActive = true;

    @Builder.Default
    private int progress = 0;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Overview {
        private String subject;
        private String duration;
        private String examDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyPlan {
        private String week;
        @Builder.Default
        private List<String> goals = new ArrayList<>();
        @Builder.Default
        private List<DailyTask> dailyTasks = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyTask {
        private String day;
        private String duration;
        @Builder.Default
        private List<TaskItem> tasks = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskItem {
        private String text;
        @Builder.Default
        private boolean completed = false;
    }
}
