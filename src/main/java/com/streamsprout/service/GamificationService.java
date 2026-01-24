package com.streamsprout.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GamificationService {
    private static final int INITIAL_LEVEL = 1;
    private static final int XP_PER_LEVEL = 100;
    private final ConcurrentHashMap<String, UserProgress> userProgress = new ConcurrentHashMap<>();

    public void addXP(String userId, int xp) {
        if (userId == null || userId.isBlank() || xp <= 0) {
            return;
        }
        UserProgress progress = userProgress.computeIfAbsent(userId, key -> new UserProgress());
        progress.addXP(xp);
    }

    public UserProgress getProgress(String userId) {
        if (userId == null || userId.isBlank()) {
            return new UserProgress();
        }
        return userProgress.getOrDefault(userId, new UserProgress());
    }

    public static class UserProgress {
        private int xp = 0;
        private int level = INITIAL_LEVEL;

        /**
         * Adds XP and increments the level when thresholds are reached.
         *
         * @param amount amount of XP to add
         */
        public void addXP(int amount) {
            if (amount <= 0) {
                return;
            }
            xp += amount;
            int requiredXp = level * XP_PER_LEVEL;
            while (xp >= requiredXp) {
                xp -= requiredXp;
                level++;
                requiredXp = level * XP_PER_LEVEL;
            }
        }

        public int getXp() {
            return xp;
        }

        public int getLevel() {
            return level;
        }
    }
}
