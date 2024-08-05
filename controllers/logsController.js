const { logs, medias } = require("../database/models");

const logGetUserMail = async (req, res) => {
  try {
    const userMails = await logs.findAll({
      include: [{ model: medias }],
      order: [["createdAt", "DESC"]],
    });

    if (!userMails)
      return res.json({
        success: false,
        message: "Erreur récupération email du base de données",
      });
    const users = userMails.map((user) => {
      const value = user.dataValues;
      return {
        id: value.campagneId,
        media: value.media.media,
        mail: value.userMail,
      };
    });
    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur récupération email" });
    console.log("ERROR GET USER MAIL", error);
  }
};

module.exports = { logGetUserMail };
