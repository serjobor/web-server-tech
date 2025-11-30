import axios from 'axios';
import pug from 'pug';

const login = 'b8d44289-d86a-471b-9f1d-aceec5c9e948';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.query.path?.join('/') || '';

  try {
    // GET /login/
    if (req.method === 'GET' && path === 'login') {
      return res.status(200).send(login);
    }

    // GET /wordpress/wp-json/wp/v2/posts/1
    if (req.method === 'GET' && path === 'wordpress/wp-json/wp/v2/posts/1') {
      const postData = {
        id: 1,
        slug: login,
        title: { rendered: login },
        content: { rendered: "", protected: false }
      };
      return res.status(200).json(postData);
    }

    // POST /render/
    if (req.method === 'POST' && path === 'render') {
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
      return res.status(200).send(html);
    }

    // Default response for any other path
    return res.status(200).send(login);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Internal Server Error: ' + error.message);
  }
}