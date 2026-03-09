const { EntitySystem } = require('./EntitySystem');
const { PhysicsEngine } = require('./PhysicsEngine');
const { DetectionSystem } = require('./DetectionSystem');
const { BehaviorEngine } = require('./BehaviorEngine');

class GameEngine {
    constructor({ detectionRadius = 60 } = {}) {
        this.entitySystem = new EntitySystem();
        this.physics = new PhysicsEngine();
        this.detection = new DetectionSystem();
        this.behavior = new BehaviorEngine();
        this.detectionRadius = detectionRadius;
    }

    tick(state, dtMs) {
        const dt = dtMs / 1000;
        state.time += dt;

        for (const entity of state.entities) {
            this.entitySystem.validateEntity(entity);
            if (entity.behavior === 'zigzag') {
                this.behavior.zigzag(entity, state.time);
            }
            if (entity.behavior === 'orbit') {
                this.behavior.orbit(entity, entity.orbit || { cx: 400, cy: 300, r: 120, dTheta: 0.05 });
            }
            const neighbors = this.detection.detectWithinRadius(entity, state.entities, this.detectionRadius);
            const threat = neighbors.filter((n) => n.type === 'enemy' || n.type === 'boss').length;
            const allyBonus = neighbors.filter((n) => n.type === 'ally').length;
            this.behavior.adaptiveSpeed(entity, state.time, threat, allyBonus);
            if (entity.speed) {
                entity.vx = entity.speed;
            }
            this.physics.integrate(entity, dt);
        }

        state.telemetry.ticks = (state.telemetry.ticks || 0) + 1;
        return state;
    }
}

module.exports = { GameEngine };
