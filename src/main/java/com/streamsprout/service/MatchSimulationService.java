package com.streamsprout.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class MatchSimulationService {
    private static final int MIN_TEAMS_REQUIRED = 2;
    private static final int MAX_SCORE = 13;
    private static final List<String> TEAMS = List.of("Sentinels", "LOUD", "Fnatic", "DRX");
    private static final List<String> MAPS = List.of("Bind", "Ascent", "Split", "Lotus");

    public Map<String, String> generateMatch() {
        if (TEAMS.size() < MIN_TEAMS_REQUIRED || MAPS.isEmpty()) {
            return Map.of(
                "team1", "TBD",
                "team2", "TBD",
                "map", "TBD",
                "score", "0-0"
            );
        }

        List<String> shuffledTeams = new ArrayList<>(TEAMS);
        Collections.shuffle(shuffledTeams);
        ThreadLocalRandom random = ThreadLocalRandom.current();
        int team1Score = random.nextInt(MAX_SCORE + 1);
        int team2Score = random.nextInt(MAX_SCORE + 1);

        return Map.of(
            "team1", shuffledTeams.get(0),
            "team2", shuffledTeams.get(1),
            "map", MAPS.get(random.nextInt(MAPS.size())),
            "score", team1Score + "-" + team2Score
        );
    }
}
