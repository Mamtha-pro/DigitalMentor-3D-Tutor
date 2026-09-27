package com.mindmentor.backend.service;

import com.mindmentor.backend.dto.resource.WebSearchResponse;
import com.mindmentor.backend.dto.resource.WebSearchResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Lightweight web search backed by DuckDuckGo's free Instant Answer API.
 * No API key is required. Swap the base URL / parsing logic here if you'd
 * rather plug in a paid provider (Bing, SerpAPI, Tavily, etc).
 */
@Slf4j
@Service
public class WebSearchService {

    private final WebClient webClient;

    public WebSearchService(WebClient webClient) {
        this.webClient = webClient;
    }

    @SuppressWarnings("unchecked")
    public WebSearchResponse search(String query) {
        List<WebSearchResult> results = new ArrayList<>();

        try {
            Map<String, Object> body = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("api.duckduckgo.com")
                            .path("/")
                            .queryParam("q", query)
                            .queryParam("format", "json")
                            .queryParam("no_html", "1")
                            .queryParam("skip_disambig", "1")
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (body != null) {
                String abstractText = (String) body.get("AbstractText");
                String abstractUrl = (String) body.get("AbstractURL");

                if (abstractText != null && !abstractText.isBlank()) {
                    results.add(WebSearchResult.builder()
                            .title(query)
                            .url(abstractUrl)
                            .snippet(abstractText)
                            .build());
                }

                Object relatedTopics = body.get("RelatedTopics");
                if (relatedTopics instanceof List<?> topics) {
                    for (Object topicObj : topics) {
                        if (topicObj instanceof Map<?, ?> topic) {
                            Object text = topic.get("Text");
                            Object url = topic.get("FirstURL");

                            if (text != null && url != null) {
                                results.add(WebSearchResult.builder()
                                        .title(text.toString())
                                        .url(url.toString())
                                        .snippet(text.toString())
                                        .build());
                            }
                        }

                        if (results.size() >= 10) {
                            break;
                        }
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Web search failed for query '{}': {}", query, ex.getMessage());
        }

        return WebSearchResponse.builder()
                .query(query)
                .results(results)
                .build();
    }
}
