const fs = require("fs");
const jwt = require("jsonwebtoken");
const db = require("../database/models");

const verifyUserAndCreate = async (row, table) => {
  const existUser = await table.findOne({ where: { id: row?.id } });
  if (existUser) {
    existUser.set(row);
    await existUser.save();
  } else await table.create(row);
};

module.exports = async (path) => {
  const readTmp = fs.readFileSync(path, {
    encoding: "utf8",
  });
  jwt.verify(readTmp, process.env.DATA_TOKEN, async (err, decoded) => {
    if (err) return console.log("ERROR VERIFY IN APP", err);
    const row = JSON.parse(decoded.data);
    if (row?.users && row?.users?.length > 0) {
      row?.users.map(async (row) => {
        await verifyUserAndCreate(row, db.users);
      });
    } else if (row?.entreprises && row?.entreprises?.length > 0) {
      row?.entreprises.map(async (row) => {
        await verifyUserAndCreate(row, db.entreprises);
      });
    }
  });
};
