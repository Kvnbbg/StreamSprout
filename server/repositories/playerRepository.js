const { AppError } = require('../errors');

const createPlayerRepository = ({ pool }) => {
    if (!pool) {
        throw new AppError('Database connection is not configured.', 500);
    }

    return {
        async getAll() {
            const { rows } = await pool.query('SELECT * FROM players ORDER BY id ASC');
            return rows;
        },
        async getById(id) {
            const { rows } = await pool.query('SELECT * FROM players WHERE id = $1', [id]);
            return rows[0] || null;
        },
        async create({ name, role, rank, agent }) {
            const { rows } = await pool.query(
                'INSERT INTO players (name, role, rank, agent) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, role, rank, agent]
            );
            return rows[0];
        },
        async searchByName(name) {
            const { rows } = await pool.query('SELECT * FROM players WHERE name ILIKE $1', [`%${name}%`]);
            return rows;
        },
        async buildTeam({ role, agent }) {
            const { rows } = await pool.query(
                'SELECT * FROM players WHERE role = $1 AND agent = $2 ORDER BY id ASC',
                [role, agent]
            );
            return rows;
        },
    };
};

const createInMemoryPlayerRepository = () => {
    let currentId = 1;
    const players = [];

    return {
        async getAll() {
            return [...players];
        },
        async getById(id) {
            return players.find((player) => player.id === id) || null;
        },
        async create({ name, role, rank, agent }) {
            const record = {
                id: currentId,
                name,
                role,
                rank,
                agent,
            };
            currentId += 1;
            players.push(record);
            return record;
        },
        async searchByName(name) {
            const lowered = name.toLowerCase();
            return players.filter((player) => player.name.toLowerCase().includes(lowered));
        },
        async buildTeam({ role, agent }) {
            return players.filter((player) => player.role === role && player.agent === agent);
        },
    };
};

module.exports = {
    createPlayerRepository,
    createInMemoryPlayerRepository,
};
