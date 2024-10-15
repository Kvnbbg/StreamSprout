require('dotenv').config(); // Load environment variables from .env file

// Import required modules
const express = require('express'); // Framework for building web applications
const { Pool } = require('pg'); // PostgreSQL client for Node.js
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing
const bodyParser = require('body-parser'); // Middleware to parse request bodies
const axios = require('axios'); // Library for making HTTP requests
const path = require('path'); // Module for handling file paths

// Create an Express application
const app = express();
const PORT = process.env.PORT || 5000; // Port configuration

// Middleware configuration
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON bodies in incoming requests
app.use(express.static('public')); // Serve static files from the 'public' directory

// PostgreSQL connection setup using environment variables
const pool = new Pool({
    user: process.env.DB_USER || 'your_username', // Database username
    host: process.env.DB_HOST || 'localhost', // Database host
    database: process.env.DB_NAME || 'valort_db', // Database name
    password: process.env.DB_PASSWORD || 'your_password', // Database password
    port: process.env.DB_PORT || 5432, // Database port
});

// Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html')); // Send index.html from public directory
});

// Route to get all players
app.get('/players', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM players'); // Query to fetch all players
        res.status(200).json(result.rows); // Return player data as JSON
    } catch (error) {
        console.error('Error fetching players:', error); // Log error details
        res.status(500).json({ error: 'Internal Server Error', details: error.message }); // Return error response
    }
});

// Route to get a player by ID
app.get('/players/:id', async (req, res) => {
    const playerId = req.params.id; // Extract player ID from request parameters
    try {
        const result = await pool.query('SELECT * FROM players WHERE id = $1', [playerId]); // Query to fetch player by ID
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Player not found' }); // Handle case where player is not found
        }
        res.status(200).json(result.rows[0]); // Return the found player
    } catch (error) {
        console.error('Error fetching player:', error); // Log error details
        res.status(500).json({ error: 'Internal Server Error', details: error.message }); // Return error response
    }
});

// Route to add a new player
app.post('/players', async (req, res) => {
    const { name, role, rank, agent } = req.body; // Destructure player details from request body
    try {
        const result = await pool.query(
            'INSERT INTO players (name, role, rank, agent) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, role, rank, agent] // Insert player into the database
        );
        res.status(201).json(result.rows[0]); // Return the newly created player
    } catch (error) {
        console.error('Error adding player:', error); // Log error details
        res.status(500).json({ error: 'Internal Server Error', details: error.message }); // Return error response
    }
});

// Function to call the Amazon Bedrock API for LLM response
const getResponseFromLLM = async (question) => {
    const apiKey = process.env.BEDROCK_API_KEY; // Retrieve API key from environment variables
    const endpoint = process.env.BEDROCK_API_ENDPOINT; // Retrieve API endpoint from environment variables

    try {
        const response = await axios.post(endpoint, {
            prompt: question,
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}` // Set authorization header
            }
        });
        return response.data; // Return the response data
    } catch (error) {
        console.error('Error calling LLM:', error); // Log error details
        return { answer: 'I am unable to answer that right now.', error: error.message }; // Handle API error
    }
};

// Route to handle question submissions to LLM
app.post('/ask', async (req, res) => {
    const { question } = req.body; // Extract question from request body
    try {
        const answer = await getResponseFromLLM(question); // Call the LLM function
        res.json({ answer }); // Return the answer
    } catch (error) {
        console.error('Error processing question:', error); // Log error details
        res.status(500).json({ error: 'Failed to process your question', details: error.message }); // Return error response
    }
});

// Route to search for players by name
app.get('/search-players', async (req, res) => {
    const { name } = req.query; // Extract name query parameter
    try {
        const result = await pool.query('SELECT * FROM players WHERE name ILIKE $1', [`%${name}%`]); // Query to search players by name
        res.status(200).json(result.rows); // Return found players
    } catch (error) {
        console.error('Error searching players:', error); // Log error details
        res.status(500).json({ error: 'Internal Server Error', details: error.message }); // Return error response
    }
});

// Route to build a team based on role and agent
app.post('/build-team', async (req, res) => {
    const { role, agent } = req.body; // Extract role and agent from request body
    try {
        const result = await pool.query('SELECT * FROM players WHERE role = $1 AND agent = $2', [role, agent]); // Query to find players matching role and agent
        res.status(200).json(result.rows); // Return found players
    } catch (error) {
        console.error('Error building team:', error); // Log error details
        res.status(500).json({ error: 'Internal Server Error', details: error.message }); // Return error response
    }
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`); // Log server start message
});

// Handle graceful shutdown to close database connection
process.on('SIGINT', async () => {
    console.log('Shutting down server...'); // Log shutdown message
    await pool.end(); // Close PostgreSQL connection
    process.exit(); // Exit the process
});
