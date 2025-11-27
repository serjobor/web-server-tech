const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Simple test endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'API is working!' });
});

// GET login endpoint
app.get('/api/login', (req, res) => {
  try {
    res.json({ login: 'b8d44289-d86a-471b-9f1d-aceec5c9e948' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST insert endpoint
app.post('/api/insert', async (req, res) => {
  let client;

  try {
    const { login, password, URL } = req.body;

    // Validation
    if (!login || !password || !URL) {
      return res.status(400).json({ 
        error: 'Missing required fields: login, password, URL' 
      });
    }

    console.log('Connecting to MongoDB...');
    client = new MongoClient(URL);
    await client.connect();
    console.log('Connected to MongoDB');

    const dbName = URL.split('/').pop().split('?')[0] || 'test';
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const userDocument = {
      login: login,
      password: password,
      createdAt: new Date()
    };

    console.log('Inserting document:', userDocument);
    const result = await usersCollection.insertOne(userDocument);
    console.log('Insert result:', result);
    
    res.status(200).json({ 
      success: true, 
      insertedId: result.insertedId,
      message: 'User inserted successfully'
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Export the app for Vercel
module.exports = app;