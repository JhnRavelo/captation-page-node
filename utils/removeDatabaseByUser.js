const db = require("../database/models");

module.exports = async (tables, user) => {
  await Promise.all(
    tables.map(async (table) => {
      if (
        table == "campagnes" ||
        table == "logs" ||
        table == "stats" ||
        table == "entreprises"
      ) {
        await db[table].destroy({
          where: { userId: user },
        });
      } else if (table == "users") {
        return;
      } else {
        const datas = await db[table].findAll({
          include: [
            { model: db.campagnes, where: { userId: user }, attributes: [] },
          ],
          raw: true,
        });
        await Promise.all(
          datas.map(async (data) => {
            db[table].destroy({
              where: { id: data.id },
            });
          })
        );
      }
    })
  );
};
