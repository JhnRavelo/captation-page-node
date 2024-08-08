const { pages, campagnes, entreprises } = require("../database/models");

module.exports = async () => {
  const allPages = await pages.findAll({
    include: [{ model: campagnes , include: [{model: entreprises}]}],
    order: [["createdAt", "DESC"]],
  });

  const datas = allPages.map((page) => {
    const value = page.dataValues;
    return {
      id: value.campagneId,
      idData: value.id,
      entreprise: value.campagne.entreprise.entreprise,
      titleColor: value.titleColor,
      titleBackgroundColor: value.titleBackgroundColor,
      sloganCampagne: value.slogan,
      imgCampagne: value.img,
      title: value.campagne.title,
      scanNbr: 0,
      dateDebut: value.createdAt,
    };
  });

  return datas;
};
