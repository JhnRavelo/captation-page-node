const FileHandler = require("../class/FileHandler");
const generateDataJWT = require("../utils/generateDataJWT");
const sqEI = require("../database/sequelize-import-export");
const db = require("../database/models");
const path = require("path");
const generateRandomText = require("../utils/generateRandomText");
const fs = require("fs");

const fileHandler = new FileHandler();
const exportPath = path.join(__dirname, "..", "database", "export");
const publicPath = path.join(__dirname, "..", "public");
const importPath = path.join(__dirname, "..", "database", "import");
const tmpPath = path.join(__dirname, "..", "asset");

const exportData = async (req, res) => {
  try {
    const dbex = new sqEI(db);
    const users = await db.users.findAll();
    const dataStringInFile = generateDataJWT(users);
    const tmpFileName = fs.readdirSync(tmpPath);

    if (tmpFileName && tmpFileName?.length > 0) {
      tmpFileName.map((file) => {
        if (
          fs.existsSync(path.join(tmpPath, file)) &&
          file.split(".")[file.split(".").length - 1] == "tmp"
        ) {
          fs.unlinkSync(path.join(tmpPath, file));
        }
      });
    }
    fileHandler.createFile(
      generateRandomText(10),
      dataStringInFile,
      "tmp",
      tmpPath,
      "tmpApp"
    );
    const exportFileName = `export.sequelize`;
    const pathExportFile = path.join(exportPath, exportFileName);
    await db.logs.update(
      { unRead: false },
      {
        where: {
          unRead: true,
        },
      }
    );
    dbex
      .export(pathExportFile, { excludes: ["users"] })
      .then(async (pathFile) => {
        fileHandler.compressZip(
          exportFileName,
          pathFile,
          publicPath,
          exportPath,
          "export",
          res,
        );
      })
      .catch((err) => {
        res.json({
          success: false,
          message: "Erreur dans l'exportation dans le sequelize",
        });
        console.log("ERROR EXPORT SEQUELIZE", err);
      });
  } catch (error) {
    console.log("ERROR EXPORT DATABASE", error);
    res.json({
      success: false,
      message: "Erreur dans l'exportation du base de données",
    });
  }
};

module.exports = { exportData };
