const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  pageAdd,
  pageGetAll,
  pageUpdate,
  pageDelete,
  getSinglePage,
  pageGetImg,
} = require("../controllers/pagesController");
const router = express.Router();
const multer = require("multer");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .post(memoryStorage.any(), verifyJWT, pageAdd)
  .get(verifyJWT, pageGetAll)
  .put(memoryStorage.any(), verifyJWT, pageUpdate);

router.delete("/delete/:id", verifyJWT, pageDelete);
router.get("/single-page", getSinglePage);

router.get("/img/:id", pageGetImg);

module.exports = router;
