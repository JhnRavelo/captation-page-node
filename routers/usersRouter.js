const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const { userLogin, userLogout } = require("../controllers/usersController");

router.post("/login", userLogin);
router.get("/logout", verifyJWT, userLogout);

module.exports = router;
