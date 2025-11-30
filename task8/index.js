import express from 'express';
import axios from 'axios';
import pug from 'pug';

// TODO: Добавьте ваш логин
const login = 'b8d44289-d86a-471b-9f1d-aceec5c9e948';

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.get('/login/', (_, res) => {
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

app.use(express.json());

app.post('/render/', async (req, res) => {
  try {
    const { random2, random3 } = req.body;
    const { addr } = req.query;

    const templateResponse = await axios.get(addr);
    const pugTemplate = templateResponse.data;

    const compiled = pug.compile(pugTemplate);
    const html = compiled({ random2, random3 });

    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error rendering template:', error);
    res.status(500).send('Error rendering template');
  }
});

// Используем стандартный HTTP порт 3000 вместо 443 (HTTPS)
const PORT = process.env.PORT || 3000;

// Запускаем HTTP сервер вместо HTTPS
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;