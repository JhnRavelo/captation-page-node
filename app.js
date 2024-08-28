const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const db = require("./database/models");
const { Op } = require("sequelize");
require("dotenv").config();
const app = express();
const path = require("path");
const sendEmail = require("./utils/sendEmail");

db.sequelize.options.logging = false;
db.sequelize.sync({ alter: true }).then(() => {
  app.listen(process.env.SERVER_PORT, async () => {
    try {
      const userMails = await db.logs.findAll({
        where: { userMail: { [Op.not]: null }, campagneId: { [Op.not]: null } },
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
          const differenceDate = nowDate - new Date(valueMail.createdAt);

          if (differenceDate && differenceDate >= 0) {
            const filterMails = allMails.filter(
              (user) => user.dataValues.campagneId == valueMail.campagneId
            );

            if (filterMails && filterMails?.length > 0) {
              filterMails.map((filterMail, index) => {
                const campagneMail = filterMail.dataValues;
                const differenceCampagne =
                  campagneMail.delay * 1000 * 60 * 60 * 24 -
                  (differenceDate + 20 * 1000);

                if (differenceCampagne >= 0) {
                  setTimeout(async () => {
                    await sendEmail(
                      campagneMail.campagne.entreprise.entreprise,
                      mail.userMail,
                      campagneMail.object,
                      campagneMail.mailText,
                      campagneMail.campagneId,
                      campagneMail.title,
                      campagneMail.img,
                      index
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
app.use("/data", datasRouter);

// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });
