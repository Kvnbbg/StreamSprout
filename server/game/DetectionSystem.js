class DetectionSystem {
    static distance(a, b) {
        return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    }

    detectWithinRadius(origin, entities, radius) {
        return entities.filter((e) => e.id !== origin.id && DetectionSystem.distance(origin, e) <= radius);
    }
}

module.exports = { DetectionSystem };
