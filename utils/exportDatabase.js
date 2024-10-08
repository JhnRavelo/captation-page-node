const db = require("../database/models");

module.exports = async (tables, user) => {
  let data = {};
  await Promise.all(
    tables.map(async (table) => {
      if (
        table == "campagnes" ||
        table == "logs" ||
        table == "stats" ||
        table == "entreprises"
      ) {
        const datas = await db[table].findAll({
          where: { userId: user },
        });
        data = { ...data, [table]: datas };
      } else if (table == "users") {
        const datas = await db[table].findAll({
          where: { id: user },
        });
        data = { ...data, [table]: datas };
      } else {
        const datas = await db[table].findAll({
          include: [
            { model: db.campagnes, where: { userId: user }, attributes: [] },
          ],
          raw: true,
        });
        data = { ...data, [table]: datas };
      }
    })
  );
  return data;
};
