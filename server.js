// server.js
'use strict';

process.env.NODE_ENV = 'production';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const app = next({
  dev: false,        // ← حتماً false باشد
  dir: __dirname,
});

const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOSTNAME || 'localhost';

app.prepare().then(() => {
  createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});