package com.mindmentor.backend.repository;

import com.mindmentor.backend.entity.StudyPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface StudyPlanRepository extends MongoRepository<StudyPlan, String> {
    List<StudyPlan> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<StudyPlan> findByIdAndUserId(String id, String userId);
}
