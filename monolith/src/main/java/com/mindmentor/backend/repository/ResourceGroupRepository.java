package com.mindmentor.backend.repository;

import com.mindmentor.backend.entity.ResourceGroup;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ResourceGroupRepository extends MongoRepository<ResourceGroup, String> {
    List<ResourceGroup> findByUserIdOrderByLastUpdatedDesc(String userId);
    Optional<ResourceGroup> findByUserIdAndTopicIgnoreCase(String userId, String topic);
    Optional<ResourceGroup> findByIdAndUserId(String id, String userId);
}
