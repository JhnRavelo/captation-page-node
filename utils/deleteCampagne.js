const {
  qrcodes,
  mails,
  campagnes,
  entreprises,
  pages,
  logs,
  stats,
} = require("../database/models");
const FileHandler = require("../class/FileHandler");
const path = require("path");
const privatePath = path.join(__dirname, "..", "private");
const mailPath = path.join(__dirname, "..", "public", "mail");

module.exports = async (id, user) => {
  const isCampagne = await campagnes.findOne({
    where: { id: id },
    include: [{ model: entreprises }],
  });

  if (!isCampagne) return { success: false, message: "Campagne non trouvé" };
  const isQRCodes = await qrcodes.findAll({ where: { campagneId: id } });
  const isMails = await mails.findAll({ where: { campagneId: id } });
  const isPage = await pages.findOne({ where: { campagneId: id } });
  const fileHandler = new FileHandler();
  const userPath = path.join(privatePath, `user_${user}`);

  if (isQRCodes) {
    isQRCodes.map((qrCode) => {
      fileHandler.deleteFileFromDatabase(
        qrCode.qrcode,
        path.join(userPath, "qrcode"),
        "qrcode"
      );
    });
    await qrcodes.destroy({ where: { campagneId: id } });
  }

  if (isMails) {
    isMails.map((mail) => {
      fileHandler.deleteFileFromDatabase(
        mail.img,
        path.join(mailPath, `user_${user}`),
        "mail"
      );
    });
    await mails.destroy({ where: { campagneId: id } });
  }

  if (isPage) {
    fileHandler.deleteFileFromDatabase(
      isPage.img,
      path.join(userPath, "page"),
      "page"
    );
    await isPage.destroy();
  }
  await logs.create({
    deleteId: id,
    entrepriseId: isCampagne.entrepriseId,
    title: isCampagne.title,
    userId: user,
  });
  await logs.update(
    { title: isCampagne.title, entrepriseId: isCampagne.entrepriseId },
    { where: { campagneId: id } }
  );
  await stats.update(
    { title: isCampagne.title, entreprise: isCampagne.entreprise.entreprise },
    { where: { campagneId: id } }
  );
  const result = await isCampagne.destroy();

  if (!result)
    return {
      success: false,
      message: "Erreur campagne " + id + " non supprimé",
    };
  return { success: true, message: "campagne " + id + " supprimé" };
};
