package com.mindmentor.learning.controller;

import com.mindmentor.learning.dto.studyplan.CreateStudyPlanRequest;
import com.mindmentor.learning.dto.studyplan.UpdateTaskRequest;
import com.mindmentor.learning.entity.StudyPlan;
import com.mindmentor.learning.service.StudyPlanService;
import com.mindmentor.learning.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/study-plans")
@RequiredArgsConstructor
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    @GetMapping
    public ResponseEntity<List<StudyPlan>> listPlans() {
        return ResponseEntity.ok(
                studyPlanService.listPlans(SecurityUtil.currentUserId())
        );
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createPlan(
            @Valid @RequestBody CreateStudyPlanRequest request) {

        StudyPlan plan = studyPlanService.createPlan(
                SecurityUtil.currentUserId(),
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("plan", plan));
    }

    @PatchMapping("/{id}/tasks")
    public ResponseEntity<StudyPlan> updateTask(
            @PathVariable String id,
            @Valid @RequestBody UpdateTaskRequest request) {

        return ResponseEntity.ok(
                studyPlanService.updateTask(
                        SecurityUtil.currentUserId(),
                        id,
                        request
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(
            @PathVariable String id) {

        studyPlanService.deletePlan(
                SecurityUtil.currentUserId(),
                id
        );

        return ResponseEntity.noContent().build();
    }
}