/**
 * Локальный сервер для BAZI PRO (CORS, ES modules, геокодинг)
 * Запуск: node server.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = 3080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const server = http.createServer(function (req, res) {
  var url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/") url = "/index.html";
  var filePath = path.join(ROOT, url.replace(/^\//, "").replace(/\.\./g, ""));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    var ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, function () {
  console.log("BAZI PRO → http://localhost:" + PORT + "/");
  console.log("Тесты → http://localhost:" + PORT + "/tests/run-tests.html");
});
