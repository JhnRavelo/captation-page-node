const { logs, medias, campagnes, entreprises } = require("../database/models");
const sequelize = require("sequelize");

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

const logsGetAll = async (req, res) => {
  try {
    const dataLogs = await logs.findAll({
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const dataLogsUnread = await logs.findAll({
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      order: [["createdAt", "DESC"]],
      where: { unRead: true },
    });

    if (!dataLogs || !dataLogsUnread)
      return res.json({
        success: false,
        message: "Erreur récupération des journals du base de données",
      });
    const datas = dataLogs.map((data) => {
      const value = data.dataValues;
      if (value?.userMail) {
        return {
          id: value.campagneId,
          media: value.media.media,
          mail: value.userMail,
          entreprise: value.campagne.entreprise.entreprise,
          dateDebut: value.createdAt,
        };
      } else
        return {
          id: value.campagneId,
          media: value.media.media,
          entreprise: value.campagne.entreprise.entreprise,
          title: value.campagne.title,
          dateDebut: value.createdAt,
        };
    });
    const notifs = dataLogsUnread
      .map((data) => {
        const value = data.dataValues;

        if (value?.userMail)
          return {
            id: value.campagneId,
            media: value.media.media,
            mail: value.userMail,
            entreprise: value.campagne.entreprise.entreprise,
          };
      })
      .filter((data) => data !== undefined);
    res.json({ success: true, datas, notifs });
  } catch (error) {
    res.json({
      success: false,
      message: "Erreur serveur récupération des journals",
    });
    console.log("ERROR GET LOG ALL", error);
  }
};

module.exports = { logGetUserMail, logsGetAll };