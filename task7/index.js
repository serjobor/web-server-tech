const express = require('express');
const { MongoClient } = require('mongodb');

const https = require('https');
const fs = require('fs');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use(express.urlencoded({ extended: true }));

app.get('/login/', (_, res) => {
  // TODO: Добавьте ваш логин
  res.send('your-login');
});

app.post('/insert/', async (req, res) => {
  let client;

  try {
    const { login, password, URL } = req.body;

    client = new MongoClient(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await client.connect();

    // Get DB from URL -> "readusers"
    const dbName = URL.split('/').pop().split('?')[0];
    const db = client.db(dbName);

    const usersCollection = db.collection('users');

    const userDocument = {
      login: login,
      password: password,
      createdAt: new Date()
    };

    await usersCollection.insertOne(userDocument);

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  } finally {
    if (client) {
      await client.close();
    }
  }
});

const PORT = 443;

// TODO: Добавьте пути к вашим сертификатам
const options = {
  key: fs.readFileSync('./privkey.pem'),
  cert: fs.readFileSync('./fullchain.pem')
};

const server = https.createServer(options, app);

server.listen(PORT);
