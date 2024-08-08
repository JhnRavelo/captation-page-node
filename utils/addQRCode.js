const generateQRCode = require("./generateQRCode");
const { qrcodes } = require("../database/models");
const path = require("path");
const getAllQRCodes = require("./getAllQRCodes");

const qrCodePath = path.join(__dirname, "..", "public", "qrcode");
const logoPath = path.join(__dirname, "..", "public", "logo");

module.exports = async (
  filePath,
  res,
  url,
  isMedia,
  campagnes
) => {
  const fileName =
    filePath.split("logo").length > 2
      ? filePath.split("logo").slice(1).join("logo")
      : filePath.split("logo")[1];
  const location = await generateQRCode(
    url,
    path.join(logoPath, fileName),
    qrCodePath
  );
  const result = await qrcodes.create({
    campagneId: campagnes,
    mediaId: isMedia.id,
    url: url,
    qrcode: location,
  });

  if (!result)
    return res.json({
      success: false,
      message: "Erreur d'ajout du QRCode dans la base de données",
    });
  const datas = await getAllQRCodes();
  res.json({ datas, success: true });
  return fileName;
};
