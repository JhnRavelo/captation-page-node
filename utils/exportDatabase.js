const db = require("../database/models");

module.exports = async (tables, user) => {
  let data = {};
  await Promise.all(
    tables.map(async (table) => {
      const tableName = table.split(".")[0];
      if (
        tableName == "campagnes" ||
        tableName == "logs" ||
        tableName == "stats" ||
        tableName == "entreprises"
      ) {
        const datas = await db[tableName].findAll({
          where: { userId: user },
        });
        data = { ...data, [tableName]: datas };
      } else if (tableName == "users") {
        const datas = await db[tableName].findAll({
          where: { id: user },
        });
        data = { ...data, [tableName]: datas };
      } else {
        const datas = await db[tableName].findAll({
          include: [
            { model: db.campagnes, where: { userId: user }, attributes: [] },
          ],
          raw: true,
        });
        data = { ...data, [tableName]: datas };
      }
    })
  );
  return data;
};
