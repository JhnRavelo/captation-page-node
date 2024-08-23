module.exports = (sequelize, Datatypes) => {
  const mails = sequelize.define("mails", {
    id: {
      type: Datatypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    object: {
      type: Datatypes.STRING,
      allowNull: false,
    },
    title: {
      type: Datatypes.STRING,
      allowNull: false,
    },
    img: {
      type: Datatypes.STRING,
      allowNull: true,
    },
    mailText: {
      type: Datatypes.TEXT,
      allowNull: false,
    },
    delay: {
      type: Datatypes.INTEGER,
      allowNull: true,
    }
  });

  mails.associate = (models) => {
    mails.belongsTo(models.campagnes, { foreignKey: "campagneId" });
  };

  return mails;
};
