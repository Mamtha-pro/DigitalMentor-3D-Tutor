package com.mindmentor.resource.dto;

import com.mindmentor.resource.entity.ResourceGroup;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceListResponse {

    private List<ResourceGroup> resources;
}