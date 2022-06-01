require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const videosRouter = require("./routes/videos");
const usersRouter = require("./routes/users");
const loginRouter = require("./routes/login");

const app = express();

app.use( express.json() );

mongoose
  .connect("mongodb://localhost/videoapi")
  .then(() => console.log("Connected to Mongo"))
  .catch((err) => console.log("Mongo does not work" + err));

app.get("/", (req, res) => {
  res.send("home");
});

app.use("/api/videos", videosRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.listen(3000);
