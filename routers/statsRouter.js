const express = require("express");
const {
  statAdd,
  statAddEmail,
  statGetAll,
} = require("../controllers/statsController");
const verifyJWT = require("../middlewares/verifyJWT");
const router = express.Router();

router.route("/").post(statAdd).get(verifyJWT, statGetAll);
router.post("/add-email", statAddEmail);

module.exports = router;
