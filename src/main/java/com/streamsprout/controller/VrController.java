package com.streamsprout.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vr")
@CrossOrigin(origins = "*")
public class VrController {

    @GetMapping("/status")
    public Map<String, String> getVrStatus() {
        return Map.of(
            "status", "development",
            "message", "VR integration is currently in development",
            "github", "https://github.com/Kvnbbg/Vision-Week-Virtual-Exploration"
        );
    }
}
