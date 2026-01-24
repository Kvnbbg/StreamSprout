package com.streamsprout.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/vr")
@CrossOrigin(origins = "*")
public class VrController {
    private static final String STATUS_KEY = "status";
    private static final String MESSAGE_KEY = "message";
    private static final String GITHUB_KEY = "github";
    private static final String VR_STATUS = "development";
    private static final String VR_MESSAGE = "VR integration is currently in development";
    private static final String VR_GITHUB = "https://github.com/Kvnbbg/Vision-Week-Virtual-Exploration";

    @GetMapping("/status")
    public Map<String, String> getVrStatus() {
        return Map.of(
            STATUS_KEY, VR_STATUS,
            MESSAGE_KEY, VR_MESSAGE,
            GITHUB_KEY, VR_GITHUB
        );
    }
}
