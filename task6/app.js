// app.js
import fs from "fs";
import crypto from "crypto";
import http from "http";

const TEXT_PLAIN_HEADER = {
  "Content-Type": "text/plain; charset=utf-8",
};

export const SYSTEM_LOGIN = "b8d44289-d86a-471b-9f1d-aceec5c9e948";

/** Чтение файла через поток */
function readFileAsync(filePath, createReadStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = createReadStream(filePath);

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", (err) => reject(err));
  });
}

/** Генерация SHA1 хеша */
function generateSha1Hash(text) {
  return crypto.createHash("sha1").update(text).digest("hex");
}

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

/** Создание Express-приложения */
export function createApp(express, bodyParser, createReadStream, crypto, http) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Обработка OPTIONS запросов (просто отвечаем 200)
  app.options("/*", (req, res) => {
    res.sendStatus(200);
  });

  // Возвращает системный логин
  app.get("/login/", (req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  // Возвращает содержимое текущего файла
  app.get("/code/", async (req, res) => {
    try {
      const fileContent = await readFileAsync("./app.js", createReadStream);
      res.set(TEXT_PLAIN_HEADER).send(fileContent);
    } catch (err) {
      res.status(500).set(TEXT_PLAIN_HEADER).send("Error reading file");
    }
  });

  // Возвращает SHA1 хеш переданного параметра
  app.get("/sha1/:input/", (req, res) => {
    const hash = generateSha1Hash(req.params.input);
    res.set(TEXT_PLAIN_HEADER).send(hash);
  });

  // GET /req/?addr=<url>
  app.get("/req/", async (req, res) => {
    try {
      const data = await fetchUrlData(req.query.addr);
      res.set(TEXT_PLAIN_HEADER).send(data);
    } catch (err) {
      res.status(500).set(TEXT_PLAIN_HEADER).send(err.toString());
    }
  });

  // POST /req/ с JSON { addr: <url> }
  app.post("/req/", async (req, res) => {
    try {
      const data = await fetchUrlData(req.body.addr);
      res.set(TEXT_PLAIN_HEADER).send(data);
    } catch (err) {
      res.status(500).set(TEXT_PLAIN_HEADER).send(err.toString());
    }
  });

  // Любой другой маршрут возвращает системный логин
  app.all("*", (req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  return app;
}
