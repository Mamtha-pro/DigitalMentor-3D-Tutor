package com.mindmentor.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

/**
 * Talks to a locally running Ollama instance (http://localhost:11434) using
 * the "smollm" model, as configured under app.ollama.* in application.yml.
 */
@Slf4j
@Service
public class OllamaService {

    private final WebClient webClient;
    private final String baseUrl;
    private final String generatePath;
    private final String model;
    private final long timeoutMs;

    public OllamaService(
            WebClient webClient,
            @Value("${app.ollama.base-url}") String baseUrl,
            @Value("${app.ollama.generate-path}") String generatePath,
            @Value("${app.ollama.model}") String model,
            @Value("${app.ollama.timeout-ms}") long timeoutMs) {
        this.webClient = webClient;
        this.baseUrl = baseUrl;
        this.generatePath = generatePath;
        this.model = model;
        this.timeoutMs = timeoutMs;
    }

    @SuppressWarnings("unchecked")
    public String generate(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "prompt", prompt,
                "stream", false
        );

        try {
            Map<String, Object> response = webClient.post()
                    .uri(baseUrl + generatePath)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(Duration.ofMillis(timeoutMs));

            if (response == null || response.get("response") == null) {
                throw new IllegalStateException("Ollama returned an empty response");
            }

            return response.get("response").toString().trim();
        } catch (Exception ex) {
            log.error("Ollama request failed ({} at {}{}): {}", model, baseUrl, generatePath, ex.getMessage());
            throw new IllegalStateException("The AI tutor service is currently unavailable", ex);
        }
    }
}
