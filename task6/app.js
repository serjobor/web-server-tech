const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
  "Access-Control-Allow-Headers": "*",
};

const TEXT_PLAIN_HEADER = {
  "Content-Type": "text/plain; charset=utf-8",
};

const SYSTEM_LOGIN = "b8d44289-d86a-471b-9f1d-aceec5c9e948";

/** Middleware для CORS */
function corsMiddleware(req, res, next) {
  res.set(CORS_HEADERS);
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
}

/** Генерация SHA1 хеша */
function generateSha1Hash(text) {
  return require("crypto").createHash("sha1").update(text).digest("hex");
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
    require("http").get(url, async (response) => {
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
function createApp(express, bodyParser) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(corsMiddleware);

  // Возвращает системный логин
  app.get("/login/", (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  // Возвращает содержимое текущего файла
  app.get("/code/", async (_req, res) => {
    try {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(__dirname, "app.js");
      const fileContent = fs.readFileSync(filePath, "utf8");
      res.set(TEXT_PLAIN_HEADER).send(fileContent);
    } catch (err) {
      res.status(500).send("Error reading file");
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
      res.status(500).send(err.toString());
    }
  });

  // POST /req/ с JSON { addr: <url> }
  app.post("/req/", async (req, res) => {
    try {
      const data = await fetchUrlData(req.body.addr);
      res.set(TEXT_PLAIN_HEADER).send(data);
    } catch (err) {
      res.status(500).send(err.toString());
    }
  });

  // Любой другой маршрут возвращает системный логин
  app.all(/.*/, (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  return app;
}

module.exports = { createApp, SYSTEM_LOGIN };