package com.mindmentor.backend.service;

import com.mindmentor.backend.dto.note.NoteRequest;
import com.mindmentor.backend.entity.Note;
import com.mindmentor.backend.exception.ApiException;
import com.mindmentor.backend.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;

    public List<Note> listNotes(String userId) {
        return noteRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public Note createNote(String userId, NoteRequest request) {
        Note note = Note.builder()
                .userId(userId)
                .title(blankToDefault(request.getTitle(), "Untitled"))
                .content(request.getContent() != null ? request.getContent() : "")
                .build();

        return noteRepository.save(note);
    }

    public Note updateNote(String userId, String noteId, NoteRequest request) {
        Note note = noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> ApiException.notFound("Note not found"));

        if (request.getTitle() != null) {
            note.setTitle(blankToDefault(request.getTitle(), "Untitled"));
        }

        if (request.getContent() != null) {
            note.setContent(request.getContent());
        }

        return noteRepository.save(note);
    }

    public void deleteNote(String userId, String noteId) {
        Note note = noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> ApiException.notFound("Note not found"));

        noteRepository.delete(note);
    }

    private String blankToDefault(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }
}
