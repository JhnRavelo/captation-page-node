module.exports = (sequelize, DataTypes) => {
  const entreprises = sequelize.define("entreprises", {
    id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entreprise: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  entreprises.associate = (models) => {
    entreprises.hasMany(models.campagnes, { foreignKey: "entrepriseId" });
    entreprises.hasMany(models.qrcodes, { foreignKey: "entrepriseId" });
    entreprises.hasMany(models.pages, { foreignKey: "entrepriseId" });
  };

  return entreprises;
};
