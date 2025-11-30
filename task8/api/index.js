import axios from 'axios';
import pug from 'pug';

const login = 'b8d44289-d86a-471b-9f1d-aceec5c9e948';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Return the WordPress post data
    const postData = {
      id: 1,
      slug: login,
      title: {
        rendered: login
      },
      content: {
        rendered: "",
        protected: false
      },
      status: "publish",
      type: "post",
      date: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    return res.status(200).json(postData);

  } catch (error) {
    console.error('WordPress API error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}