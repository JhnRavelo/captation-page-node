const { campagnes, users, entreprises } = require("../database/models");

module.exports = async () => {
  const allCampagnes = await campagnes.findAll({
    include: [{ model: users }, { model: entreprises }],
    order: [["createdAt", "DESC"]],
  });

  const datas = allCampagnes.map((campagne) => {
    const value = campagne.dataValues;
    return {
      user: value.user.name,
      description: value.description,
      title: value.title,
      id: value.id,
      entreprise: value.entreprise.entreprise,
      dateDebut: value.dateDebut,
      dateFin: value.dateFin,
      mailText: value.mailText,
      object: value.object,
      logo: value.entreprise.logo ? value.entreprise.logo : "",
      idData: value.id,
    };
  });

  return datas;
};
