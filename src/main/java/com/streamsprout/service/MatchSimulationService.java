package com.streamsprout.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class MatchSimulationService {
    private final List<String> teams = Arrays.asList("Sentinels", "LOUD", "Fnatic", "DRX");
    private final List<String> maps = Arrays.asList("Bind", "Ascent", "Split", "Lotus");

    public Map<String, String> generateMatch() {
        Collections.shuffle(teams);
        Random rand = new Random();
        
        return Map.of(
            "team1", teams.get(0),
            "team2", teams.get(1),
            "map", maps.get(rand.nextInt(maps.size())),
            "score", rand.nextInt(13) + "-" + rand.nextInt(13)
        );
    }
}
