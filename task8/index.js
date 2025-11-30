import express from 'express';
import axios from 'axios';
import pug from 'pug';

const login = 'b8d44289-d86a-471b-9f1d-aceec5c9e948';

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

// Routes
app.get('/login', (_, res) => {
  res.send(login);
});

app.get('/wordpress/wp-json/wp/v2/posts/1', (_, res) => {
  res.json({
    id: 1,
    slug: login,
    title: {
      rendered: login
    },
    content: {
      rendered: "",
      protected: false
    }
  });
});

app.post('/render', async (req, res) => {
  try {
    const { random2, random3 } = req.body;
    const { addr } = req.query;

    if (!addr) {
      return res.status(400).send('Missing addr parameter');
    }

    const templateResponse = await axios.get(addr);
    const pugTemplate = templateResponse.data;

    const compiled = pug.compile(pugTemplate);
    const html = compiled({ random2, random3 });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error rendering template:', error);
    res.status(500).send('Error rendering template: ' + error.message);
  }
});

// Health check
app.get('/', (_, res) => {
  res.send('Server is running');
});

// Handle OPTIONS for CORS preflight
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Export for Vercel serverless
export default app;