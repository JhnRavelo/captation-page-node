const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJWT = async (req, res, next) => {
  const authHeader = await req.headers.authorization;
  if (!authHeader) return res.sendStatus(403);
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) return res.sendStatus(403);

    req.user = decoded.id;
    req.role = decoded.role;
    next();
  });
};

module.exports = verifyJWT;
