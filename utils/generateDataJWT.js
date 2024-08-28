const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (data) => {
  const dataToken = jwt.sign(
    { data: JSON.stringify(data) },
    process.env.DATA_TOKEN
  );
  return dataToken;
};
