class GameStateStore {
    constructor() {
        this.sessions = new Map();
    }

    getOrCreate(sessionId) {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
                time: 0,
                entities: [],
                telemetry: { ticks: 0 },
            });
        }
        return this.sessions.get(sessionId);
    }

    save(sessionId, state) {
        this.sessions.set(sessionId, state);
    }
}

module.exports = { GameStateStore };
