const {campagnes, users} = require("../database/models");

module.exports = async () => {
  const allCampagnes = await campagnes.findAll({
    include: [{ model: users }],
    order: [["createdAt", "DESC"]],
  });

  const datas = allCampagnes.map((campagne) => {
    const value = campagne.dataValues;
    return {
        user: value.user.name,
        description: value.description,
        title: value.title,
        id: value.id,
        entreprise: value.entreprise,
        dateDebut: value.dateDebut,
        dateFin: value.dateFin
    }
  })

  return datas;
};
