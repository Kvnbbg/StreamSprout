// Import required modules
const express = require('express');
const { Pool } = require('pg'); // PostgreSQL client for Node.js
const cors = require('cors'); // Middleware to enable CORS
const bodyParser = require('body-parser'); // Middleware to parse request bodies
const axios = require('axios'); // For making HTTP requests

// Create an Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.static('public')); // Serve static files

// PostgreSQL connection setup
const pool = new Pool({
    user: 'your_username', // Replace with your PostgreSQL username
    host: 'localhost', // Database host
    database: 'valort_db', // Replace with your database name
    password: 'your_password', // Replace with your PostgreSQL password
    port: 5432, // Default PostgreSQL port
});

// Default route to handle root URL
app.get('/', (req, res) => {
    res.send('Welcome to the VALORANT Esports Manager Assistant API!'); // Customize this message as needed
});

// Route to get all players
app.get('/players', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM players');
        res.status(200).json(result.rows); // Return player data as JSON
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get player by ID
app.get('/players/:id', async (req, res) => {
    const playerId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM players WHERE id = $1', [playerId]);
        if (result.rows.length === 0) {
            return res.status(404).send('Player not found');
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to add a new player
app.post('/players', async (req, res) => {
    const { name, role, rank, agent } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO players (name, role, rank, agent) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, role, rank, agent]
        );
        res.status(201).json(result.rows[0]); // Return the newly created player
    } catch (error) {
        console.error('Error adding player:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Function to call Amazon Bedrock API
const getResponseFromLLM = async (question) => {
    try {
        const response = await axios.post('YOUR_BEDROCK_API_ENDPOINT', {
            prompt: question,
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer YOUR_API_KEY` // Replace with your actual API key
            }
        });
        return response.data; // Adjust according to the API response structure
    } catch (error) {
        console.error('Error calling LLM:', error);
        return { answer: 'I am unable to answer that right now.' };
    }
};

// Route to handle question submissions
app.post('/ask', async (req, res) => {
    const { question } = req.body;
    const answer = await getResponseFromLLM(question);
    res.json({ answer });
});

app.get('/search-players', async (req, res) => {
    const { name } = req.query;
    const result = await pool.query('SELECT * FROM players WHERE name ILIKE $1', [`%${name}%`]);
    res.status(200).json(result.rows);
});


app.post('/build-team', async (req, res) => {
    const { role, agent } = req.body;
    const result = await pool.query('SELECT * FROM players WHERE role = $1 AND agent = $2', [role, agent]);
    res.status(200).json(result.rows);
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await pool.end();
    process.exit();
});
