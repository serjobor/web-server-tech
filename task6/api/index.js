const express = require("express");
const bodyParser = require("body-parser");
const { createReadStream } = require("fs");

const { createApp } = require("../app.js");

const app = createApp(
  express,
  bodyParser,
  createReadStream,
  __filename
);

module.exports = app;
