module.exports = (sequelize, DataTypes) => {
  const campagnes = sequelize.define("campagnes", {
    id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.STRING,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateDebut: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateFin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    entreprise: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  campagnes.associate = (models) => {
    campagnes.belongsTo(models.users, {
      foreignKey: "userId",
    });
  };

  return campagnes;
};
