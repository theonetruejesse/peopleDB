require("dotenv").config();

const express = require("express");
const app = express();
const port = 3000;

app.get("/sync", async (_, res) => {
  const syncPeopleDBs = require("./sync");
  const people = await syncPeopleDBs();
  res.send(people);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
