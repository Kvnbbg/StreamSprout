const DEFAULT_POLICY = {
    speed: 6.5,
    behavior: 'evade',
    color: 'blue',
    risk_posture: 'safe',
    ttl_ms: 1500,
};

class AIDecisionGateway {
    constructor({ policyClient, telemetry }) {
        this.policyClient = policyClient;
        this.telemetry = telemetry;
        this.cache = new Map();
        this.failures = 0;
        this.openUntil = 0;
    }

    validate(output) {
        const allowedBehavior = new Set(['normal', 'zigzag', 'orbit', 'flocking_lite', 'evade']);
        const allowedRisk = new Set(['safe', 'balanced', 'aggressive']);
        const allowedColor = new Set(['blue', 'red', 'green', 'gold', 'cyan', 'violet']);

        return output
            && typeof output.speed === 'number'
            && output.speed >= 1.5
            && output.speed <= 14
            && allowedBehavior.has(output.behavior)
            && allowedRisk.has(output.risk_posture)
            && allowedColor.has(output.color)
            && Number.isInteger(output.ttl_ms)
            && output.ttl_ms >= 500
            && output.ttl_ms <= 5000;
    }

    async decide(input) {
        const now = Date.now();
        const key = JSON.stringify(input);

        if (now < this.openUntil && this.cache.has(key)) {
            this.telemetry.inc('aiFallbacks');
            return this.cache.get(key);
        }

        const attempts = [120, 360, 0];
        for (let i = 0; i < attempts.length; i += 1) {
            try {
                if (attempts[i] > 0) {
                    await new Promise((resolve) => setTimeout(resolve, attempts[i]));
                }
                const output = await this.policyClient(input);
                if (!this.validate(output)) {
                    throw new Error('Invalid AI output schema');
                }
                this.failures = 0;
                this.cache.set(key, output);
                return output;
            } catch (error) {
                this.failures += 1;
                if (this.failures >= 5) {
                    this.openUntil = Date.now() + 10000;
                }
            }
        }

        this.telemetry.inc('aiFallbacks');
        return this.cache.get(key) || DEFAULT_POLICY;
    }
}

module.exports = { AIDecisionGateway, DEFAULT_POLICY };
