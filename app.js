const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const db = require("./database/models");
const { Op } = require("sequelize");
require("dotenv").config();
const app = express();
const path = require("path");
const FileHandler = require("./class/FileHandler");
const sendEmail = require("./utils/sendEmail");
const mysql = require("mysql2/promise");

const fileHandler = new FileHandler();

mysql
  .createConnection({
    user: process.env.USER,
    password: process.env.PASSWORD,
  })
  .then((connection) => {
    connection
      .query(`CREATE DATABASE IF NOT EXISTS ${process.env.DATABASE_NAME};`)
      .then(() => {
        db.sequelize.options.logging = false;
        db.sequelize.sync({ alter: true }).then(() => {
          app.listen(process.env.SERVER_PORT, async () => {
            try {
              const userMails = await db.logs.findAll({
                where: {
                  userMail: { [Op.not]: null },
                  campagneId: { [Op.not]: null },
                },
              });
              const allMails = await db.mails.findAll({
                where: { campagneId: { [Op.not]: null } },
                include: [
                  { model: db.campagnes, include: [{ model: db.entreprises }] },
                ],
              });

              if (userMails) {
                userMails.map((mail) => {
                  const nowDate = new Date();
                  const valueMail = mail.dataValues;
                  const differenceDate =
                    nowDate - new Date(valueMail.createdAt);

                  if (differenceDate && differenceDate >= 0) {
                    const filterMails = allMails.filter(
                      (user) =>
                        user.dataValues.campagneId == valueMail.campagneId
                    );

                    if (filterMails && filterMails?.length > 0) {
                      filterMails.map((filterMail, index) => {
                        const campagneMail = filterMail.dataValues;
                        const differenceCampagne =
                          campagneMail.delay * 1000 * 60 * 60 * 24 -
                          (differenceDate + 20 * 1000);

                        if (differenceCampagne >= 0) {
                          setTimeout(async () => {
                            const content = getContentEmailForClient(
                              campagneMail.title,
                              campagneMail.img,
                              mail.userMail,
                              campagneMail.campagneId,
                              campagneMail.mailText
                            );
                            await sendEmail(
                              campagneMail.campagne.entreprise.entreprise,
                              mail.userMail,
                              campagneMail.object,
                              content,
                            );
                          }, differenceCampagne);
                        }
                      });
                    }
                  }
                });
              }
              console.log(`http://localhost:${process.env.SERVER_PORT}`);
            } catch (error) {
              console.log("ERROR CHECK SEND EMAIL", error);
            }

            const assetPath = path.join(__dirname, "asset");
            const privatePath = path.join(__dirname, "private");
            try {
              const users = await db.users.findAll();
              const entreprises = await db.entreprises.findAll();
              const medias = await db.medias.findAll();
              if (entreprises?.length > 0 && users?.length > 0) {
                await fileHandler.removeDirectories([], assetPath);
                await fileHandler.copyFile(
                  ["avatar", "entreprise", "logo"],
                  privatePath,
                  assetPath
                );
              }
              await fileHandler.generateData(
                users?.length > 0 ? { users, entreprises, medias } : undefined,
                assetPath
              );
            } catch (error) {
              console.log("ERROR USER CREATE", error);
            }
          });
        });
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

const entrepriseRouter = require("./routers/entreprisesRouter");
app.use("/entreprise", entrepriseRouter);

const qrCodesRouter = require("./routers/qrcodesRouter");
app.use("/qr-code", qrCodesRouter);

const pagesRouter = require("./routers/pagesRouter");
app.use("/page", pagesRouter);

const statsRouter = require("./routers/statsRouter");
app.use("/stat", statsRouter);

const logsRouter = require("./routers/logsRouter");
app.use("/log", logsRouter);

const datasRouter = require("./routers/datasRouter");
const getContentEmailForClient = require("./utils/getContentEmailForClient");
app.use("/data", datasRouter);

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
