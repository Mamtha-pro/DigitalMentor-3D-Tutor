package com.mindmentor.backend.repository;

import com.mindmentor.backend.entity.StudySession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface StudySessionRepository extends MongoRepository<StudySession, String> {
    List<StudySession> findByUserIdOrderByStartTimeDesc(String userId);
    List<StudySession> findByUserIdAndStartTimeAfterOrderByStartTimeDesc(String userId, Instant after);
}
