const fs = require("fs");
const jwt = require("jsonwebtoken");
const db = require("../database/models");

const verifyDataAndCreate = async (row, table) => {
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
    const rowEntries = Object.entries(row);
    rowEntries.forEach(([key, values]) => {
      if (values && values.length > 0) {
        values.map(async (value) => {
          await verifyDataAndCreate(value, db[key]);
        });
      }
    });
  });
};
