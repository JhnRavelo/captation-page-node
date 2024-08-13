const express = require("express");
const {
  statAdd,
  statAddEmail,
  statGetAll,
  statOpenedEmail,
} = require("../controllers/statsController");
const verifyJWT = require("../middlewares/verifyJWT");
const router = express.Router();

router.route("/").post(statAdd).get(verifyJWT, statGetAll);
router.post("/add-email", statAddEmail);
router.get("/track-open", statOpenedEmail);

module.exports = router;
