const sqEI = require("../database/sequelize-import-export");
const db = require("../database/models");

module.exports = (location) => {
  const dbex = new sqEI([
    db.medias,
    db.campagnes,
    db.pages,
    db.qrcodes,
    db.logs,
    db.mails,
    db.stats,
  ]);
  const error = dbex
    .import(location, { overwrite: true, excludes: ["users", "entreprises"] })
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.log("ERROR IMPORT SEQUELIZE", err);
      return false;
    });
  return error;
};
