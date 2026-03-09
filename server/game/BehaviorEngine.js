class BehaviorEngine {
    zigzag(entity, t, config = { A: 18, omega: 1.8, phi: 0 }) {
        const { A, omega, phi } = config;
        const y0 = entity.baseY ?? entity.y;
        entity.y = y0 + A * Math.sin(omega * t + phi);
        return entity;
    }

    orbit(entity, config = { cx: 0, cy: 0, r: 120, dTheta: 0.04 }) {
        const { cx, cy, r, dTheta } = config;
        entity.theta = (entity.theta || 0) + dTheta;
        entity.x = cx + r * Math.cos(entity.theta);
        entity.y = cy + r * Math.sin(entity.theta);
        return entity;
    }

    adaptiveSpeed(entity, t, threat, allyBonus, config = { vmin: 2, vmax: 15, v0: 6, alpha: 1.2, beta: 2, gamma: 0.8 }) {
        const { vmin, vmax, v0, alpha, beta, gamma } = config;
        const next = v0 + alpha * Math.log(1 + t) - beta * threat + gamma * allyBonus;
        entity.speed = Math.max(vmin, Math.min(vmax, next));
        return entity;
    }
}

module.exports = { BehaviorEngine };
