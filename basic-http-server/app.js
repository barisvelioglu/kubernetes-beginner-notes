'use strict';

const express = require('express');
const os = require('os');
// Constants
const port = process.env.PORT || 8080;

// App
const app = express();
app.get('/', (req, res) => {
  console.log(`Received request for URL: ${req.url}`);
  res.writeHead(200);
  res.end(`Hello, World!\nHostname: ${os.hostname()}\n`);
});

app.listen(port);
console.log(`server listening on port ${port}`);