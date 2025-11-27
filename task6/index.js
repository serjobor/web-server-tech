const express = require("express");
const bodyParser = require("body-parser");
const appSrc = require("./app.js");

const app = appSrc.createApp(express, bodyParser);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});