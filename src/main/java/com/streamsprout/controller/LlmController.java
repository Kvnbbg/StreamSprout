package com.streamsprout.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/llm")
@CrossOrigin(origins = "*")
public class LlmController {

    private static final String DEFAULT_RESPONSE_MESSAGE = "Share a bit more about your team goals or map.";
    private static final String RESPONSE_KEY = "response";
    private static final List<String> RESPONSE_TEMPLATES = List.of(
        "Based on current meta, I recommend...",
        "Pro players are favoring %s this week",
        "Latest tournament results show...",
        "Team composition suggestion: 2 duelists, 1 controller, 1 initiator, 1 sentinel"
    );

    private static final List<String> AGENTS = List.of("Viper", "Omen", "Brimstone", "Jett");

    /**
     * Returns a demo-friendly LLM response for the incoming request payload.
     *
     * @param request request payload that may include user input fields
     * @return response payload containing the generated reply
     */
    @PostMapping
    public Map<String, String> handleMessage(@RequestBody(required = false) Map<String, String> request) {
        if (request == null || request.isEmpty()) {
            return Map.of(RESPONSE_KEY, DEFAULT_RESPONSE_MESSAGE);
        }

        String response = generateResponse();
        return Map.of(RESPONSE_KEY, response);
    }

    private String generateResponse() {
        if (RESPONSE_TEMPLATES.isEmpty()) {
            return DEFAULT_RESPONSE_MESSAGE;
        }

        String template = RESPONSE_TEMPLATES.get(ThreadLocalRandom.current().nextInt(RESPONSE_TEMPLATES.size()));
        if (!template.contains("%s")) {
            return template;
        }

        if (AGENTS.isEmpty()) {
            return DEFAULT_RESPONSE_MESSAGE;
        }

        String agent = AGENTS.get(ThreadLocalRandom.current().nextInt(AGENTS.size()));
        return String.format(template, agent);
    }
}
