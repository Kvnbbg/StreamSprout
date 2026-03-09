class PhysicsEngine {
    integrate(entity, dtSeconds) {
        entity.x += entity.vx * dtSeconds;
        entity.y += entity.vy * dtSeconds;
        return entity;
    }
}

module.exports = { PhysicsEngine };
