class RenderAdapter {
    toClientState(state) {
        return {
            time: state.time,
            entities: state.entities.map((e) => ({
                id: e.id,
                type: e.type,
                x: Number(e.x.toFixed(2)),
                y: Number(e.y.toFixed(2)),
                hp: e.hp,
                state: e.state,
                tags: e.tags,
            })),
        };
    }
}

module.exports = { RenderAdapter };
