package com.mindmentor.backend.controller;

import com.mindmentor.backend.dto.note.NoteRequest;
import com.mindmentor.backend.entity.Note;
import com.mindmentor.backend.service.NoteService;
import com.mindmentor.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Notes")
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<List<Note>> listNotes() {
        return ResponseEntity.ok(noteService.listNotes(SecurityUtil.currentUserId()));
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody NoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(noteService.createNote(SecurityUtil.currentUserId(), request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable String id, @RequestBody NoteRequest request) {
        return ResponseEntity.ok(noteService.updateNote(SecurityUtil.currentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable String id) {
        noteService.deleteNote(SecurityUtil.currentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
