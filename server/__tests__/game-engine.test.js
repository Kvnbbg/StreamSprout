const test = require('node:test');
const assert = require('node:assert/strict');

const { DetectionSystem } = require('../game/DetectionSystem');
const { BehaviorEngine } = require('../game/BehaviorEngine');
const { AIDecisionGateway, DEFAULT_POLICY } = require('../game/AIDecisionGateway');
const { Telemetry } = require('../game/Telemetry');

test('DetectionSystem computes proximity with euclidean distance', () => {
    const detection = new DetectionSystem();
    const origin = { id: 'p1', x: 0, y: 0 };
    const entities = [
        { id: 'e1', x: 30, y: 40 },
        { id: 'e2', x: 100, y: 100 },
    ];

    const detected = detection.detectWithinRadius(origin, entities, 50);
    assert.equal(detected.length, 1);
    assert.equal(detected[0].id, 'e1');
});

test('BehaviorEngine adaptive speed stays clamped', () => {
    const behavior = new BehaviorEngine();
    const entity = {};
    behavior.adaptiveSpeed(entity, 1000, 20, 0, { vmin: 2, vmax: 15, v0: 6, alpha: 1, beta: 3, gamma: 0.5 });
    assert.equal(entity.speed, 2);
});

test('AIDecisionGateway falls back to safe local policy', async () => {
    const telemetry = new Telemetry();
    const gateway = new AIDecisionGateway({
        telemetry,
        policyClient: async () => {
            throw new Error('network down');
        },
    });

    const decision = await gateway.decide({ player_state: {}, nearby_entities_summary: {}, difficulty: 'normal', latency_budget_ms: 200 });
    assert.deepEqual(decision, DEFAULT_POLICY);
    assert.equal(telemetry.counters.aiFallbacks, 1);
});
