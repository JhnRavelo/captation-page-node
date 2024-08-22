const { qrcodes, entreprises, medias } = require("../database/models");
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
        [Op.and]: [{ campagneId: campagnes }, { mediaId: isMedia.id }],
      },
    });

    if (isQRCode)
      return res.json({
        success: false,
        message:
          "Il existe déjà une QR CODE pour la campagne '" +
          campagnes +
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
      const filePath = await fileHandler.createImage(req, logoPath, "png", "local");
      const fileName = await addQRCode(
        filePath,
        res,
        url,
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

const qrCodeDelete = async (req, res) => {
  const { id } = await req.params;

  try {
    if (!id)
      return res.json({ success: false, message: "Erreur ID de QR Code" });
    const deletedQRCode = await qrcodes.findOne({
      where: { id: id },
      include: [{ model: medias }],
    });

    if (!deletedQRCode)
      return res.json({
        success: false,
        message: "Erreur QR Code à supprimer non trouvé",
      });
    const fileHandler = new FileHandler();
    fileHandler.deleteFileFromDatabase(
      deletedQRCode.qrcode,
      qrCodePath,
      "qrcode"
    );
    const result = await deletedQRCode.destroy();

    if (!result)
      return res.json({
        success: false,
        message: "Erreur QR Code non supprimé",
      });
    const datas = await getAllQRCodes();
    res.json({
      success: true,
      datas,
      message:
        "QR Code " +
        deletedQRCode.campagneId +
        " pour " +
        deletedQRCode.media.media +
        " supprimé",
    });
  } catch (error) {
    res.json({ success: false, message: "Erreur de serveur" });
    console.log("ERROR QR CODE DELETE", error);
  }
};

const qrCodeDownload = async (req, res) => {
  const { img } = await req.body;

  if (!img)
    return res.json({ success: false, message: "Erreur de téléchargent" });
  try {
    const fileName =
      img.split("qrcode").length > 2
        ? img.split("qrcode").slice(1).join("qrcode")
        : img.split("qrcode")[1];
    res.download(path.join(qrCodePath, fileName));
  } catch (error) {
    console.log("ERROR QR CODE DOWNLOAD", error);
  }
};

module.exports = { qrCodeAdd, qrCodeGetAll, qrCodeDelete, qrCodeDownload };
