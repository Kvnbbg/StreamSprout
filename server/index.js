// Load environment variables from .env file
require('dotenv').config(); 

// Import required modules
const express = require('express'); // Framework for building web applications
const { Pool } = require('pg'); // PostgreSQL client for Node.js
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing
const bodyParser = require('body-parser'); // Middleware to parse request bodies
const axios = require('axios'); // Library for making HTTP requests
const path = require('path'); // Module for handling file paths
const rateLimit = require('express-rate-limit'); // Middleware to rate limit requests
// Create an Express application
const app = express();
const PORT = process.env.PORT || 5000; // Port configuration
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies in incoming requests
app.use(bodyParser.json()); // Additional JSON body parser
app.use(express.static('public')); // Serve static files from the 'public' directory

// PostgreSQL connection setup using environment variables
const pool = new Pool({
    user: process.env.DB_USER || 'your_username', // Database username
    host: process.env.DB_HOST || 'localhost', // Database host
    database: process.env.DB_NAME || 'valort_db', // Database name
    password: process.env.DB_PASSWORD || 'your_password', // Database password
    port: process.env.DB_PORT || 5432, // Database port
});

// Serve the main HTML file with rate limiting
app.get('/', indexLimiter, (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

// Database query helper function
const queryDatabase = async (query, params) => {
    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Route to get all players
app.get('/players', async (req, res) => {
    try {
        const players = await queryDatabase('SELECT * FROM players');
        res.status(200).json(players);
    } catch (error) {
        console.error('Error fetching players:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Route to get a player by ID
app.get('/players/:id', async (req, res) => {
    const playerId = req.params.id; 
    try {
        const players = await queryDatabase('SELECT * FROM players WHERE id = $1', [playerId]);
        if (players.length === 0) return res.status(404).json({ error: 'Player not found' });
        res.status(200).json(players[0]);
    } catch (error) {
        console.error('Error fetching player:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Route to add a new player
app.post('/players', async (req, res) => {
    const { name, role, rank, agent } = req.body; 
    try {
        const newPlayer = await queryDatabase(
            'INSERT INTO players (name, role, rank, agent) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, role, rank, agent]
        );
        res.status(201).json(newPlayer[0]);
    } catch (error) {
        console.error('Error adding player:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Amazon Bedrock API configuration
const apiKey = process.env.BEDROCK_API_KEY; 
const endpoint = process.env.BEDROCK_API_ENDPOINT; 

// Shared helper for Bedrock LLM calls
const callBedrockLLM = async (prompt, { maxTokens = 300 } = {}) => {
    if (!prompt) {
        throw new Error('A prompt is required to query the LLM API.');
    }

    if (!endpoint || !apiKey) {
        throw new Error('LLM API credentials are not configured.');
    }

    try {
        const { data } = await axios.post(
            endpoint,
            { prompt, max_tokens: maxTokens },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        if (!data) {
            throw new Error('The LLM API returned an empty response.');
        }

        return data;
    } catch (error) {
        const message = error.response?.data?.error || error.message;
        console.error('Error while calling LLM API:', message);
        throw new Error(message);
    }
};

// Function to call the LLM API for team compositions
const getTeamComposition = async (prompt) => callBedrockLLM(prompt, { maxTokens: 300 });

// Function to call the LLM API for general questions
const getResponseFromLLM = async (prompt) => {
    const data = await callBedrockLLM(prompt, { maxTokens: 200 });
    const answer = data?.answer ?? data?.result ?? data?.outputText;
    return typeof answer === 'string' ? answer : JSON.stringify(data);
};

// Route to create a team composition
app.post('/create-team', async (req, res) => {
    const prompts = {
        "Professional Team Submission": "Build a team using only players from VCT International...",
        // Other prompts...
    };

    const { type } = req.body;
    const prompt = prompts[type];

    if (!prompt) return res.status(400).json({ error: 'Invalid team type' });

    try {
        const teamComposition = await getTeamComposition(prompt);
        res.json(teamComposition);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving team composition', details: error.message });
        console.error('Error retrieving team composition:', error.message);
    }
});

// Route to handle question submissions to LLM
app.post('/ask', async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }
    try {
        const answer = await getResponseFromLLM(question);
        res.json({ answer });
    } catch (error) {
        console.error('Error processing question:', error.message);
        res.status(500).json({ error: 'Failed to process your question', details: error.message });
    }
});

// Function to search for players by name
app.get('/search-players', async (req, res) => {
    const { name } = req.query; 
    try {
        const players = await queryDatabase('SELECT * FROM players WHERE name ILIKE $1', [`%${name}%`]);
        res.status(200).json(players);
    } catch (error) {
        console.error('Error searching players:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Route to build a team based on role and agent
app.post('/build-team', async (req, res) => {
    const { role, agent } = req.body; 
    try {
        const players = await queryDatabase('SELECT * FROM players WHERE role = $1 AND agent = $2', [role, agent]);
        res.status(200).json(players);
    } catch (error) {
        console.error('Error building team:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown to close database connection
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await pool.end();
    process.exit();
});

exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
};
