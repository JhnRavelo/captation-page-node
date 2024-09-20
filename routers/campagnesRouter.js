const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const {
  campagneAdd,
  campagneGetAll,
  campagneUpdate,
  campagneUpdateMail,
  campagneDelete,
  campagneGetMail,
} = require("../controllers/campagnesController");
const multer = require("multer");
const sendEmail = require("../utils/sendEmail");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .post(verifyJWT, campagneAdd)
  .get(verifyJWT, campagneGetAll)
  .put(verifyJWT, campagneUpdate);

router.put("/mail", verifyJWT, memoryStorage.any(), campagneUpdateMail);
router.get("/mail", verifyJWT, campagneGetMail);
router.delete("/delete/:id", verifyJWT, campagneDelete);

router.get("/send-sms", async (req, res) => {
  console.log("RUN")
  const result = await sendEmail();

  if (result) {
    return res.sendStatus(200);
  } else return res.sendStatus(400);
});

module.exports = router;
