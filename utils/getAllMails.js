const { mails } = require("../database/models");

module.exports = async () => {
  const getMails = await mails.findAll();

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
