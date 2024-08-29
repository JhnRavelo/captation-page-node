const fs = require("fs");
const jwt = require("jsonwebtoken");
const db = require("../database/models");

const verifyUserAndCreate = async (row) => {
  const existUser = await db.users.findOne({ where: { id: row?.id } });
  if (existUser) {
    existUser.set(row);
    await existUser.save();
  } else await db.users.create(row);
};

module.exports = async (path) => {
  const readTmp = fs.readFileSync(path, {
    encoding: "utf8",
  });
  jwt.verify(readTmp, process.env.DATA_TOKEN, async (err, decoded) => {
    if (err) return console.log("ERROR VERIFY IN APP", err);
    const rows = JSON.parse(decoded.data);
    if (rows?.length && rows.length > 0) {
      rows.map(async (row) => {
        await verifyUserAndCreate(row);
      });
    } else {
      await verifyUserAndCreate(rows);
    }
  });
};
