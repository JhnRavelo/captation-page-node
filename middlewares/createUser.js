const { users } = require("../database/models");
const FileHandler = require("../class/FileHandler");
const path = require("path");

const fileHandler = new FileHandler();
const assetPath = path.join(__dirname, "..", "asset");

const createUser = async (req, res, next) => {
  const allUsers = await users.findAll();
  if (allUsers.length == 0) {
    await fileHandler.generateUser(null, assetPath);
    next();
  } else next();
};

module.exports = createUser;
