const { mails, campagnes } = require("../database/models");

module.exports = async (id) => {
  const getMails = await mails.findAll({
    include: [{ model: campagnes, where: { userId: id } }],
  });

  const datas = getMails.map((mail) => {
    const value = mail.dataValues;
    return {
      id: value.id,
      idData: value.campagneId,
      imgCampagne: value.img,
      title: value.title,
      object: value.object,
      mailText: value.mailText,
      delay: value.delay,
    };
  });

  return datas;
};
