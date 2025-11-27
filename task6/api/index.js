// api/index.js
const fs = require("fs");
const crypto = require("crypto");
const http = require("http");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
  "Access-Control-Allow-Headers": "*",
};

const TEXT_PLAIN_HEADER = {
  "Content-Type": "text/plain; charset=utf-8",
};

const SYSTEM_LOGIN = "b8d44289-d86a-471b-9f1d-aceec5c9e948";

/** Чтение данных из HTTP-ответа */
function readHttpResponse(response) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    response.on("data", (chunk) => chunks.push(chunk));
    response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    response.on("error", (err) => reject(err));
  });
}

/** Универсальная функция для GET-запроса по URL */
async function fetchUrlData(url) {
  return new Promise((resolve, reject) => {
    http.get(url, async (response) => {
      try {
        const data = await readHttpResponse(response);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    }).on("error", reject);
  });
}

/** Генерация SHA1 хеша */
function generateSha1Hash(text) {
  return crypto.createHash("sha1").update(text).digest("hex");
}

module.exports = async (req, res) => {
  // Устанавливаем CORS заголовки
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Обработка preflight запроса
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { method, url, query, body } = req;
    const path = url.split('?')[0];

    // GET /login/
    if (method === "GET" && path === "/api/login") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(SYSTEM_LOGIN);
    }

    // GET /code/
    if (method === "GET" && path === "/api/code") {
      // Получаем путь к текущему файлу
      const currentFilePath = __dirname + "/index.js";
      const fileContent = await fs.promises.readFile(currentFilePath, "utf8");
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(fileContent);
    }

    // GET /sha1/:input/
    if (method === "GET" && path.startsWith("/api/sha1/")) {
      const input = path.split("/api/sha1/")[1];
      if (input) {
        const hash = generateSha1Hash(input);
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.status(200).send(hash);
      }
    }

    // GET /req/?addr=<url>
    if (method === "GET" && path === "/api/req" && query.addr) {
      const data = await fetchUrlData(query.addr);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(data);
    }

    // POST /req/ с JSON { addr: <url> }
    if (method === "POST" && path === "/api/req") {
      let bodyData = body;
      
      // Если body это строка, парсим её
      if (typeof bodyData === "string") {
        try {
          bodyData = JSON.parse(bodyData);
        } catch (e) {
          return res.status(400).send("Invalid JSON");
        }
      }
      
      if (bodyData && bodyData.addr) {
        const data = await fetchUrlData(bodyData.addr);
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.status(200).send(data);
      }
    }

    // Любой другой маршрут возвращает системный логин
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(SYSTEM_LOGIN);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};