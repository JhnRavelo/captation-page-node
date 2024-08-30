const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const {
  userLogin,
  userLogout,
  userEditProfile,
  userEditAvatar,
  userPasswordForget,
} = require("../controllers/usersController");
const multer = require("multer");
const createUser = require("../middlewares/createUser");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router.post("/login", createUser ,userLogin);
router.get("/logout", verifyJWT, userLogout);
router.post("/edit", verifyJWT, userEditProfile);
router.put("/edit/avatar", verifyJWT, memoryStorage.any(), userEditAvatar);
router.post("/password-forget", userPasswordForget);

module.exports = router;
