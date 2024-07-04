const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const {
  userLogin,
  userLogout,
  userEditProfile,
} = require("../controllers/usersController");

router.post("/login", userLogin);
router.get("/logout", verifyJWT, userLogout);
router.post("/edit", verifyJWT, userEditProfile);

module.exports = router;
