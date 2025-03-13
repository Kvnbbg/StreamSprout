package com.streamsprout.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/llm")
@CrossOrigin(origins = "*")
public class LlmController {

    private final List<String> responses = Arrays.asList(
        "Based on current meta, I recommend...",
        "Pro players are favoring %s this week",
        "Latest tournament results show...",
        "Team composition suggestion: 2 duelists, 1 controller, 1 initiator, 1 sentinel"
    );

    private final List<String> agents = Arrays.asList("Viper", "Omen", "Brimstone", "Jett");

    @PostMapping
    public Map<String, String> handleMessage(@RequestBody Map<String, String> request) {
        String response = generateResponse();
        return Map.of("response", response);
    }

    private String generateResponse() {
        Random rand = new Random();
        String template = responses.get(rand.nextInt(responses.size()));
        return String.format(template, agents.get(rand.nextInt(agents.size())));
    }
}
