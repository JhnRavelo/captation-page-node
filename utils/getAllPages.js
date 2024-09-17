const { pages, campagnes, entreprises } = require("../database/models");

module.exports = async (id) => {
  const allPages = await pages.findAll({
    include: [
      { model: campagnes, userId: id, include: [{ model: entreprises }] },
    ],
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
      description: value.campagne.description,
      imgCampagne: value.img,
      dateDebut: value.createdAt,
    };
  });

  return datas;
};
