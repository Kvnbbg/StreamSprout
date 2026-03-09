const TYPES = new Set(['enemy', 'ally', 'neutral', 'power_up', 'boss']);

class EntitySystem {
    validateEntity(entity) {
        const required = ['id', 'type', 'x', 'y', 'vx', 'vy', 'hp', 'state', 'tags'];
        for (const field of required) {
            if (entity[field] === undefined) {
                throw new Error(`Entity missing field: ${field}`);
            }
        }
        if (!TYPES.has(entity.type)) {
            throw new Error(`Entity type invalid: ${entity.type}`);
        }
        if (!Array.isArray(entity.tags)) {
            throw new Error('Entity tags must be an array.');
        }
    }
}

module.exports = { EntitySystem, TYPES };
