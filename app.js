const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const db = require("./database/models");
require("dotenv").config();
const app = express();

db.sequelize.options.logging = false;
db.sequelize.sync().then(() => {
  app.listen(process.env.SERVER_PORT, async () => {
    console.log(`http://localhost:${process.env.SERVER_PORT}`);
  });
});

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  })
);
app.use(express.static("public/"));
app.use(cookieParser());

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const usersRouter = require("./routers/usersRouter");
app.use("/auth", usersRouter);

const refreshRouter = require("./routers/refreshRouter");
app.use("/refresh", refreshRouter);

const campagnesRouter = require("./routers/campagnesRouter");
app.use("/campagne", campagnesRouter);
