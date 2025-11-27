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
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// GET endpoint
app.get('/api/login', (_, res) => {
  res.json({ login: 'b8d44289-d86a-471b-9f1d-aceec5c9e948' });
});

// POST endpoint
app.post('/api/insert', async (req, res) => {
  let client;

  try {
    const { login, password, URL } = req.body;

    if (!login || !password || !URL) {
      return res.status(400).json({ 
        error: 'Missing required fields: login, password, URL' 
      });
    }

    client = new MongoClient(URL);
    await client.connect();

    const dbName = URL.split('/').pop().split('?')[0] || 'test';
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const userDocument = {
      login: login,
      password: password,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(userDocument);
    
    res.status(200).json({ 
      success: true, 
      insertedId: result.insertedId 
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
    }
  }
});

// Health check endpoint
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'OK' });
});

// Export for Vercel
module.exports = app;