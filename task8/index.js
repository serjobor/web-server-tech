import express from 'express';
import axios from 'axios';
import pug from 'pug';
import https from 'https';
import fs from 'fs';

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
  const { random2, random3 } = req.body;
  const { addr } = req.query;

  const templateResponse = await axios.get(addr);
  const pugTemplate = templateResponse.data;

  const compiled = pug.compile(pugTemplate);
  const html = compiled({ random2, random3 });

  res.set('Content-Type', 'text/html');
  res.send(html);
});

// const PORT = 443;

// // TODO: Добавьте пути к вашим сертификатам
// const options = {
//   key: fs.readFileSync('/your-key-path/privkey.pem'),
//   cert: fs.readFileSync('/your-cert-path/fullchain.pem')
// };

// const server = https.createServer(options, app);

// server.listen(PORT);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});