const express = require("express");
const { createReadStream } = require("fs");
const bodyParser = require("body-parser");

const { createApp } = require("./app.js");

const app = createApp(
  express,
  bodyParser,
  createReadStream,
  __filename
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
