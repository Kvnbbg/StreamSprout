package com.streamsprout.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GamificationService {
    private final ConcurrentHashMap<String, UserProgress> userProgress = new ConcurrentHashMap<>();

    public void addXP(String userId, int xp) {
        UserProgress progress = userProgress.computeIfAbsent(userId, k -> new UserProgress());
        progress.addXP(xp);
    }

    public UserProgress getProgress(String userId) {
        return userProgress.getOrDefault(userId, new UserProgress());
    }

    public static class UserProgress {
        private int xp = 0;
        private int level = 1;
        
        public void addXP(int amount) {
            xp += amount;
            if(xp >= level * 100) {
                level++;
                xp %= 100;
            }
        }

        // Getters
        public int getXp() { return xp; }
        public int getLevel() { return level; }
    }
}
