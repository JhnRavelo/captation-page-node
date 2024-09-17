const {
  stats,
  medias,
  logs,
  campagnes,
  entreprises,
  mails,
} = require("../database/models");
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const sendEmail = require("../utils/sendEmail");

const statAdd = async (req, res) => {
  const { idCampagne, media } = await req.body;

  try {
    if (!idCampagne || !media) return res.json({ success: false });
    const isMedia = await medias.findOne({ where: { url: media } });
    const isCampagne = await campagnes.findOne({ where: { id: idCampagne } });

    if (!isMedia || !isCampagne) return res.json({ success: false });
    const newStat = await stats.create({
      campagneId: idCampagne,
      mediaId: isMedia.id,
      userId: isCampagne.userId,
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
    const isMedia = await medias.findOne({ where: { url: media } });

    if (!isMedia) return res.json({ success: false });
    const isEmail = await logs.findOne({
      where: { [Op.and]: [{ userMail: email }, { campagneId: idCampagne }] },
    });
    const hasCampagnes = await campagnes.findOne({ where: { id: idCampagne } });

    if (isEmail || !hasCampagnes) return res.json({ success: false });

    if (!id) {
      await stats.create({
        campagneId: idCampagne,
        mediaId: isMedia.id,
        mail: true,
        userId: hasCampagnes.userId,
      });
    } else {
      await stats.update({ mail: true }, { where: { id: id } });
    }

    await logs.create({
      campagneId: idCampagne,
      mediaId: isMedia.id,
      userMail: email,
      userId: hasCampagnes.userId,
    });
    const isCampagnes = await mails.findAll({
      where: { campagneId: idCampagne },
      include: [{ model: campagnes, include: [{ model: entreprises }] }],
    });

    if (!isCampagnes || isCampagnes.length == 0)
      return res.json({ success: false });
    isCampagnes.map((mail, index) => {
      setTimeout(async () => {
        await sendEmail(
          mail.campagne.entreprise.entreprise,
          email,
          mail.object,
          mail.mailText,
          idCampagne,
          mail.title,
          mail.img,
          index
        );
      }, mail.delay * 24 * 60 * 60 * 1000);
    });
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
        "entreprise",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "entrepriseId", "entreprise"],
      where: { [Op.and]: [{ userId: req.user }, { mail: true }] },
    });

    const nbrScanPerYears = await stats.findAll({
      attributes: [
        [sequelize.literal("YEAR(stats.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("stats.id")), "count"],
        "campagneId",
        "entreprise",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "entrepriseId", "entreprise"],
      where: { userId: req.user },
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
      where: {
        [Op.and]: [
          { mail: true },
          { campagneId: { [Op.not]: null } },
          { userId: req.user },
        ],
      },
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
      where: {
        [Op.and]: [{ campagneId: { [Op.not]: null } }, { userId: req.user }],
      },
    });

    const nbrMailPerMonths = await stats.findAll({
      where: { [Op.and]: [{ userId: req.user }, { mail: true }] },
      attributes: [
        [sequelize.literal("YEAR(stats.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("stats.id")), "count"],
        [sequelize.literal("MONTH(stats.createdAt)"), "month"],
        "campagneId",
        "entreprise",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "month", "entrepriseId", "entreprise"],
    });

    const nbrScanPerMonths = await stats.findAll({
      where: { userId: req.user },
      attributes: [
        [sequelize.literal("YEAR(stats.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("stats.id")), "count"],
        [sequelize.literal("MONTH(stats.createdAt)"), "month"],
        "campagneId",
        "entreprise",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "month", "entrepriseId", "entreprise"],
    });

    const nbrMailPerMonthPerCampagnes = await stats.findAll({
      where: {
        [Op.and]: [
          { mail: true },
          { campagneId: { [Op.not]: null } },
          { userId: req.user },
        ],
      },
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
      where: {
        [Op.and]: [{ userId: req.user }, { campagneId: { [Op.not]: null } }],
      },
    });

    const nbrMailOpened = await logs.findAll({
      attributes: [
        [sequelize.literal("YEAR(logs.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("logs.id")), "count"],
        "entrepriseId",
        "campagneId",
        "deleteId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
        { model: entreprises },
      ],
      group: ["year", "mediaId", "entrepriseId"],
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                [Op.and]: [
                  { campagneId: { [Op.not]: null } },
                  { opened: true },
                ],
              },
              {
                [Op.and]: [{ title: { [Op.not]: null } }, { opened: true }],
              },
            ],
          },
          { userId: req.user },
        ],
      },
    });

    const nbrMailOpenedPerCampagnes = await logs.findAll({
      attributes: [
        [sequelize.literal("YEAR(logs.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("logs.id")), "count"],
        "entrepriseId",
        "campagneId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "entrepriseId", "campagneId"],
      where: {
        [Op.and]: [
          { campagneId: { [Op.not]: null } },
          { opened: true },
          { userId: req.user },
        ],
      },
    });

    const nbrMailOpenedPerMonths = await logs.findAll({
      attributes: [
        [sequelize.literal("YEAR(logs.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("logs.id")), "count"],
        [sequelize.literal("MONTH(logs.createdAt)"), "month"],
        "entrepriseId",
        "campagneId",
        "deleteId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
        { model: entreprises },
      ],
      group: ["year", "mediaId", "entrepriseId", "month"],
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                [Op.and]: [
                  { campagneId: { [Op.not]: null } },
                  { opened: true },
                ],
              },
              {
                [Op.and]: [{ title: { [Op.not]: null } }, { opened: true }],
              },
            ],
          },
          { userId: req.user },
        ],
      },
    });

    const nbrMailOpenedPerMonthPerCampagnes = await logs.findAll({
      attributes: [
        [sequelize.literal("YEAR(logs.createdAt)"), "year"],
        [sequelize.fn("COUNT", sequelize.col("logs.id")), "count"],
        [sequelize.literal("MONTH(logs.createdAt)"), "month"],
        "entrepriseId",
        "campagneId",
      ],
      include: [
        { model: medias },
        { model: campagnes, include: [{ model: entreprises }] },
      ],
      group: ["year", "mediaId", "entrepriseId", "campagneId", "month"],
      where: {
        [Op.and]: [
          { campagneId: { [Op.not]: null } },
          { opened: true },
          { userId: req.user },
        ],
      },
    });

    if (
      !nbrMailPerYears ||
      !nbrScanPerYears ||
      !nbrMailPerMonths ||
      !nbrScanPerMonths ||
      !nbrMailPerMonthPerCampagnes ||
      !nbrScanPerMonthPerCampagnes ||
      !nbrMailPerYearPerCampagnes ||
      !nbrScanPerYearPerCampagnes ||
      !nbrMailOpened
    )
      return res.json({
        success: false,
        message: "Erreur récupération des statistiques",
      });

    const nbrMailPerYearStats = nbrMailPerYears
      .map((stat) => {
        const value = stat.dataValues;

        if (value?.entreprise) {
          return {
            media: value.media.media,
            entreprise: value.entreprise,
            count: value.count,
            year: value.year,
            dateDebut: value.year + "-1",
          };
        } else if (value?.campagne?.entreprise?.entreprise) {
          return {
            media: value.media.media,
            entreprise: value.campagne.entreprise.entreprise,
            count: value.count,
            year: value.year,
            id: value.campagneId,
            dateDebut: value.year + "-1",
            title: value.campagne.title,
          };
        } else return undefined;
      })
      .filter((item) => item !== undefined);

    const nbrScanPerYearStats = nbrScanPerYears
      .map((stat) => {
        const value = stat.dataValues;

        if (value?.entreprise) {
          return {
            media: value.media.media,
            entreprise: value.entreprise,
            count: value.count,
            year: value.year,
            dateDebut: value.year + "-1",
          };
        } else if (value?.campagne?.entreprise?.entreprise) {
          return {
            media: value.media.media,
            entreprise: value.campagne.entreprise.entreprise,
            count: value.count,
            year: value.year,
            id: value.campagneId,
            dateDebut: value.year + "-1",
            title: value.campagne.title,
          };
        } else return undefined;
      })
      .filter((item) => item !== undefined);

    const nbrMailPerYearPerCampagneStats = nbrMailPerYearPerCampagnes.map(
      (stat) => {
        const value = stat.dataValues;
        return {
          media: value.media.media,
          entreprise: value.campagne.entreprise.entreprise,
          count: value.count,
          year: value.year,
          id: value.campagneId,
          dateDebut: value.year + "-1",
          title: value.campagne.title,
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
          dateDebut: value.year + "-1",
          title: value.campagne.title,
        };
      }
    );
    const nbrMailPerMonthStats = nbrMailPerMonths
      .map((stat) => {
        const value = stat.dataValues;

        if (value?.entreprise) {
          return {
            media: value.media.media,
            entreprise: value.entreprise,
            count: value.count,
            year: value.year,
            dateDebut: value.year + "-1",
            month: value.month,
          };
        } else if (value?.campagne?.entreprise?.entreprise) {
          return {
            media: value.media.media,
            entreprise: value.campagne.entreprise.entreprise,
            count: value.count,
            year: value.year,
            id: value.campagneId,
            dateDebut: value.year + "-1",
            month: value.month,
            title: value.campagne.title,
          };
        } else return undefined;
      })
      .filter((item) => item !== undefined);
    const nbrScanPerMonthStats = nbrScanPerMonths
      .map((stat) => {
        const value = stat.dataValues;

        if (value?.entreprise) {
          return {
            media: value.media.media,
            entreprise: value.entreprise,
            count: value.count,
            year: value.year,
            dateDebut: value.year + "-1",
            month: value.month,
          };
        } else if (value?.campagne?.entreprise?.entreprise) {
          return {
            media: value.media.media,
            entreprise: value.campagne.entreprise.entreprise,
            count: value.count,
            year: value.year,
            id: value.campagneId,
            dateDebut: value.year + "-1",
            month: value.month,
            title: value.campagne.title,
          };
        } else return undefined;
      })
      .filter((item) => item !== undefined);
    const nbrMailPerMonthPerCampagneStats = nbrMailPerMonthPerCampagnes.map(
      (stat) => {
        const value = stat.dataValues;
        return {
          media: value.media.media,
          entreprise: value.campagne.entreprise.entreprise,
          count: value.count,
          year: value.year,
          id: value.campagneId,
          dateDebut: value.year + "-1",
          month: value.month,
          title: value.campagne.title,
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
          dateDebut: value.year + "-1",
          month: value.month,
          title: value.campagne.title,
        };
      }
    );
    const nbrMailOpenedStats = nbrMailOpened
      .map((stat) => {
        const value = stat.dataValues;
        if (value.campagneId) {
          return {
            media: value.media.media,
            entreprise: value.campagne.entreprise.entreprise,
            count: value.count,
            year: value.year,
            id: value.campagneId,
            dateDebut: value.year + "-1",
          };
        } else if (value.entrepriseId) {
          return {
            media: value.media.media,
            entreprise: value.entreprise.entreprise,
            count: value.count,
            year: value.year,
            dateDebut: value.year + "-1",
          };
        }
      })
      .filter((stat) => stat !== undefined);
    const nbrMailOpenedPerMonthStats = nbrMailOpenedPerMonths
      .map((stat) => {
        const value = stat.dataValues;
        if (value.campagneId) {
          return {
            media: value.media.media,
            entreprise: value.campagne.entreprise.entreprise,
            count: value.count,
            year: value.year,
            id: value.campagneId,
            dateDebut: value.year + "-1",
            month: value.month,
          };
        } else if (value.entrepriseId) {
          return {
            media: value.media.media,
            entreprise: value.entreprise.entreprise,
            count: value.count,
            year: value.year,
            dateDebut: value.year + "-1",
            month: value.month,
          };
        }
      })
      .filter((stat) => stat !== undefined);
    const nbrMailOpenedPerCampagneStats = nbrMailOpenedPerCampagnes
      .map((stat) => {
        const value = stat.dataValues;

        return {
          media: value.media.media,
          entreprise: value.campagne.entreprise.entreprise,
          count: value.count,
          year: value.year,
          id: value.campagneId,
          dateDebut: value.year + "-1",
        };
      })
      .filter((stat) => stat !== undefined);
    const nbrMailOpenedPerMonthPerCampagneStats =
      nbrMailOpenedPerMonthPerCampagnes
        .map((stat) => {
          const value = stat.dataValues;

          return {
            media: value.media.media,
            entreprise: value.campagne.entreprise.entreprise,
            count: value.count,
            year: value.year,
            id: value.campagneId,
            dateDebut: value.year + "-1",
          };
        })
        .filter((stat) => stat !== undefined);

    res.json({
      nbrMailPerYearStats,
      nbrScanPerYearStats,
      nbrMailOpenedStats,
      nbrMailPerMonthStats,
      nbrScanPerMonthStats,
      nbrMailOpenedPerMonthStats,
      success: true,
      nbrMailPerMonthPerCampagneStats,
      nbrScanPerMonthPerCampagneStats,
      nbrMailPerYearPerCampagneStats,
      nbrScanPerYearPerCampagneStats,
      nbrMailOpenedPerCampagneStats,
      nbrMailOpenedPerMonthPerCampagneStats,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Erreur serveur récupération des statistiques",
    });
    console.log("ERROR GET ALL STAT", error);
  }
};

const statOpenedEmail = async (req, res) => {
  try {
    const email = req.query.email;
    const campagneId = req.query.id;

    if (!email || !campagneId) return res.sendStatus(400);
    let openedMail = await logs.findOne({
      where: { [Op.and]: [{ userMail: email }, { campagneId: campagneId }] },
    });

    if (!openedMail)
      openedMail = await logs.findOne({
        where: { [Op.and]: [{ userMail: email }, { deleteId: campagneId }] },
      });

    if (!openedMail) return res.sendStatus(400);
    openedMail.opened = true;
    await openedMail.save();
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur ouvert email" });
    console.log("ERROR STAT OPENED EMAIL", error);
  }
};

module.exports = { statAdd, statAddEmail, statGetAll, statOpenedEmail };
