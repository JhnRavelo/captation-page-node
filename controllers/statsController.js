const {
  stats,
  medias,
  logs,
  campagnes,
  entreprises,
} = require("../database/models");
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const sendEmail = require("../utils/sendEmail");

const statAdd = async (req, res) => {
  const { idCampagne, media } = await req.body;

  try {
    if (!idCampagne || !media) return res.json({ success: false });
    const isMedia = await medias.findOne({ where: { url: media } });

    if (!isMedia) return res.json({ success: false });
    const newStat = await stats.create({
      campagneId: idCampagne,
      mediaId: isMedia.id,
    });

    if (!newStat) return res.json({ success: false });
    res.json({ success: true, statId: newStat.id });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR STAT ADD", error);
  }
};

const statAddEmail = async (req, res) => {
  const { idCampagne, media, id, email } = await req.body;

  try {
    if (!idCampagne || !media || !email) return res.json({ success: false });
    let idStat;
    const isMedia = await medias.findOne({ where: { url: media } });

    if (!isMedia) return res.json({ success: false });
    const isEmail = await logs.findOne({ where: { userMail: email } });

    if (isEmail) return res.json({ success: false });

    if (!id) {
      const newStat = await stats.create({
        campagneId: idCampagne,
        mediaId: isMedia.id,
        mail: true,
      });
      idStat = newStat.id;
    } else {
      const currentStat = await stats.findOne({ where: { id: id } });
      currentStat.mail = true;
      await currentStat.save();
      idStat = currentStat.id;
    }

    await logs.create({
      campagneId: idCampagne,
      mediaId: isMedia.id,
      userMail: email,
    });
    const isCampagne = await campagnes.findOne({
      where: { id: idCampagne },
      include: [{ model: entreprises }],
    });

    if (!isCampagne) return res.json({ success: false });
    sendEmail(
      isCampagne.entreprise.entreprise,
      email,
      isCampagne.object,
      isCampagne.mailText
    );
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR STAT ADD EMAIL", error);
  }
};

const statGetAll = async (req, res) => {
  try {
    const nbrMailPerYears = await stats.findAll({
      attributes: [
        [sequelize.literal("YEAR(stats.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("stats.id")), "count"],
        "campagneId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "entrepriseId"],
      where: { mail: true, campagneId: { [Op.not]: null } },
    });

    const nbrScanPerYears = await stats.findAll({
      attributes: [
        [sequelize.literal("YEAR(stats.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("stats.id")), "count"],
        "campagneId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "entrepriseId"],
      where: { campagneId: { [Op.not]: null } },
    });

    const nbrMailPerYearPerCampagnes = await stats.findAll({
      attributes: [
        [sequelize.literal("YEAR(stats.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("stats.id")), "count"],
        "campagneId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "entrepriseId", "campagneId"],
      where: { mail: true, campagneId: { [Op.not]: null } },
    });

    const nbrScanPerYearPerCampagnes = await stats.findAll({
      attributes: [
        [sequelize.literal("YEAR(stats.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("stats.id")), "count"],
        "campagneId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "entrepriseId", "campagneId"],
      where: { campagneId: { [Op.not]: null } },
    });

    const nbrMailPerMonths = await stats.findAll({
      where: { mail: true, campagneId: { [Op.not]: null } },
      attributes: [
        [sequelize.literal("YEAR(stats.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("stats.id")), "count"],
        [sequelize.literal("MONTH(stats.createdAt)"), "month"],
        "campagneId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "month", "entrepriseId"],
    });

    const nbrScanPerMonths = await stats.findAll({
      attributes: [
        [sequelize.literal("YEAR(stats.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("stats.id")), "count"],
        [sequelize.literal("MONTH(stats.createdAt)"), "month"],
        "campagneId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "month", "entrepriseId"],
      where: { campagneId: { [Op.not]: null } },
    });

    const nbrMailPerMonthPerCampagnes = await stats.findAll({
      where: { mail: true, campagneId: { [Op.not]: null } },
      attributes: [
        [sequelize.literal("YEAR(stats.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("stats.id")), "count"],
        [sequelize.literal("MONTH(stats.createdAt)"), "month"],
        "campagneId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "month", "entrepriseId", "campagneId"],
    });

    const nbrScanPerMonthPerCampagnes = await stats.findAll({
      attributes: [
        [sequelize.literal("YEAR(stats.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("stats.id")), "count"],
        [sequelize.literal("MONTH(stats.createdAt)"), "month"],
        "campagneId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "month", "entrepriseId", "campagneId"],
      where: { campagneId: { [Op.not]: null } },
    });

    if (
      !nbrMailPerYears ||
      !nbrScanPerYears ||
      !nbrMailPerMonths ||
      !nbrScanPerMonths ||
      !nbrMailPerMonthPerCampagnes ||
      !nbrScanPerMonthPerCampagnes ||
      !nbrMailPerYearPerCampagnes ||
      !nbrScanPerYearPerCampagnes
    )
      return res.json({
        success: false,
        message: "Erreur récupération des statistiques",
      });
    const nbrMailPerYearStats = nbrMailPerYears.map((stat) => {
      const value = stat.dataValues;
      return {
        media: value.media.media,
        entreprise: value.campagne.entreprise.entreprise,
        count: value.count,
        year: value.year,
        id: value.campagneId,
        dateDebut: value.year + "-" + "1",
      };
    });
    const nbrScanPerYearStats = nbrScanPerYears.map((stat) => {
      const value = stat.dataValues;
      return {
        media: value.media.media,
        entreprise: value.campagne.entreprise.entreprise,
        count: value.count,
        year: value.year,
        id: value.campagneId,
        dateDebut: value.year + "-" + "1",
      };
    });
    const nbrMailPerYearPerCampagneStats = nbrMailPerYearPerCampagnes.map(
      (stat) => {
        const value = stat.dataValues;
        return {
          media: value.media.media,
          entreprise: value.campagne.entreprise.entreprise,
          count: value.count,
          year: value.year,
          id: value.campagneId,
          dateDebut: value.year + "-" + "1",
        };
      }
    );
    const nbrScanPerYearPerCampagneStats = nbrScanPerYearPerCampagnes.map(
      (stat) => {
        const value = stat.dataValues;
        return {
          media: value.media.media,
          entreprise: value.campagne.entreprise.entreprise,
          count: value.count,
          year: value.year,
          id: value.campagneId,
          dateDebut: value.year + "-" + "1",
        };
      }
    );
    const nbrMailPerMonthStats = nbrMailPerMonths.map((stat) => {
      const value = stat.dataValues;
      return {
        media: value.media.media,
        entreprise: value.campagne.entreprise.entreprise,
        count: value.count,
        year: value.year,
        id: value.campagneId,
        dateDebut: value.year + "-" + "1",
        month: value.month,
      };
    });
    const nbrScanPerMonthStats = nbrScanPerMonths.map((stat) => {
      const value = stat.dataValues;
      return {
        media: value.media.media,
        entreprise: value.campagne.entreprise.entreprise,
        count: value.count,
        year: value.year,
        id: value.campagneId,
        dateDebut: value.year + "-" + "1",
        month: value.month,
      };
    });
    const nbrMailPerMonthPerCampagneStats = nbrMailPerMonthPerCampagnes.map(
      (stat) => {
        const value = stat.dataValues;
        return {
          media: value.media.media,
          entreprise: value.campagne.entreprise.entreprise,
          count: value.count,
          year: value.year,
          id: value.campagneId,
          dateDebut: value.year + "-" + "1",
          month: value.month,
        };
      }
    );
    const nbrScanPerMonthPerCampagneStats = nbrScanPerMonthPerCampagnes.map(
      (stat) => {
        const value = stat.dataValues;
        return {
          media: value.media.media,
          entreprise: value.campagne.entreprise.entreprise,
          count: value.count,
          year: value.year,
          id: value.campagneId,
          dateDebut: value.year + "-" + "1",
          month: value.month,
        };
      }
    );
    res.json({
      nbrMailPerYearStats,
      nbrScanPerYearStats,
      nbrMailPerMonthStats,
      nbrScanPerMonthStats,
      success: true,
      nbrMailPerMonthPerCampagneStats,
      nbrScanPerMonthPerCampagneStats,
      nbrMailPerYearPerCampagneStats,
      nbrScanPerYearPerCampagneStats,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Erreur serveur récupération des statistiques",
    });
    console.log("ERROR GET ALL STAT", error);
  }
};

module.exports = { statAdd, statAddEmail, statGetAll };
