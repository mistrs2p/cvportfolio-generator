"use strict";

process.env.NODE_ENV = "production";

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const app = next({
  dev: false,
  dir: __dirname,
});

const handle = app.getRequestHandler();

const port = process.env.PORT || "8080";

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
