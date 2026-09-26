package com.mindmentor.backend.dto.note;

import lombok.Data;

@Data
public class NoteRequest {
    private String title;
    private String content;
}
