module.exports = (sequelize, DataTypes) => {
  const medias = sequelize.define("medias", {
    id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    media: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    url: {
      allowNull: true,
      type: DataTypes.STRING,
    },
  });

  medias.associate = (models) => {
    medias.hasMany(models.qrcodes, { foreignKey: "mediaId" });
  };

  return medias;
};
