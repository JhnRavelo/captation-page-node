const {
  qrcodes,
  entreprises,
  campagnes,
  medias,
} = require("../database/models");
const { Op } = require("sequelize");
require("dotenv").config();
const path = require("path");
const FileHandler = require("../class/FileHandler");
const addQRCode = require("../utils/addQRCode");
const getAllQRCodes = require("../utils/getAllQRCodes");

const logoPath = path.join(__dirname, "..", "public", "logo");
const qrCodePath = path.join(__dirname, "..", "public", "qrcode");

const qrCodeAdd = async (req, res) => {
  try {
    const { media, entreprise, campagnes } = await req.body;

    if (!media && !entreprise && !campagnes)
      return res.json({ success: false, message: "Erreur d'ajout de QRCode" });
    const isMedia = await medias.findOne({ where: { media: media } });
    const isEntreprise = await entreprises.findOne({
      where: { entreprise: entreprise },
    });
    const isQRCode = await qrcodes.findOne({
      where: {
        [Op.and]: [{ entrepriseId: isEntreprise.id }, { mediaId: isMedia.id }],
      },
    });

    if (isQRCode)
      return res.json({
        success: false,
        message:
          "Il existe déjà une campagne au nom de '" +
          isEntreprise.entreprise +
          "' pour '" +
          isMedia.media +
          "'",
      });
    const url =
      process.env.SERVER_FRONT_PATH +
      "/campagne/" +
      campagnes +
      "/" +
      isMedia.url;

    if (req.files && req.files.length > 0) {
      const fileHandler = new FileHandler();

      if (isEntreprise.logo) {
        fileHandler.deleteFileFromDatabase(isEntreprise.logo, logoPath, "logo");
      }
      const filePath = await fileHandler.createImage(req, logoPath, "png");
      const fileName = await addQRCode(
        filePath,
        res,
        url,
        isEntreprise,
        isMedia,
        campagnes
      );
      isEntreprise.logo = "logo" + fileName;
      await isEntreprise.save();
    } else
      await addQRCode(
        isEntreprise.logo,
        res,
        url,
        isEntreprise,
        isMedia,
        campagnes
      );
  } catch (error) {
    res.json({ success: false, message: "Erreur d'ajout de QR Code" });
    console.log("ERROR ADD QR CODE", error);
  }
};

const qrCodeGetAll = async (req, res) => {
  try {
    const datas = await getAllQRCodes();
    if (!datas)
      return res.json({
        success: false,
        message:
          "Erreur du recuperation des données QR Code du base de données",
      });
    res.json({ success: true, datas });
  } catch (error) {
    res.json({
      success: false,
      message: "Erreur du recuperation des données QR Code",
    });
    console.log("ERROR GET ALL QR CODE", error);
  }
};

module.exports = { qrCodeAdd, qrCodeGetAll };