const FileHandler = require("../class/FileHandler");
const generateDataJWT = require("../utils/generateDataJWT");
const sqEI = require("../database/sequelize-import-export");
const db = require("../database/models");
const path = require("path");
const generateRandomText = require("../utils/generateRandomText");
const fs = require("fs");
const { privatePath } = require("./entreprisesController");
const exportDatabase = require("../utils/exportDatabase");
require("dotenv").config();

const fileHandler = new FileHandler();
const exportPath = path.join(__dirname, "..", "database", "export");
const publicPath = path.join(__dirname, "..", "public");
const importPath = path.join(__dirname, "..", "database", "import");
const tmpPath = path.join(__dirname, "..", "asset");
const exportPrivatePath = path.join(exportPath, "private");
const exportPublicPath = path.join(exportPath, "public");

const exportData = async (req, res) => {
  try {
    const dbex = new sqEI(db);
    const users = await db.users.findAll();
    const entreprises = await db.entreprises.findAll();
    const medias = await db.medias.findAll();
    const dataStringInFile = generateDataJWT({ users, entreprises, medias });
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
    await fileHandler.copyFile(
      ["avatar", "entreprise", "logo"],
      privatePath,
      tmpPath
    );

    if (req.role == process.env.PRIME) {
      await fileHandler.copyFile([], publicPath, exportPublicPath);
      await fileHandler.copyFile([], privatePath, exportPrivatePath);
    } else {
      await fileHandler.copyFile([], privatePath, exportPrivatePath, req.user);
      await fileHandler.copyFile([], publicPath, exportPublicPath, req.user);
    }
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

    if (req.role == process.env.PRIME) {
      dbex
        .export(pathExportFile)
        .then(async (pathFile) => {
          fileHandler.compressZip(
            exportFileName,
            pathFile,
            [exportPrivatePath, exportPublicPath],
            exportPath,
            "export",
            res
          );
        })
        .catch((err) => {
          res.json({
            success: false,
            message: "Erreur dans l'exportation dans le sequelize",
          });
          console.log("ERROR EXPORT SEQUELIZE", err);
        });
    } else {
      const data = await exportDatabase(
        ["medias"],
        req.user
      );
      const dataStringInFile = generateDataJWT(data);
      const { location } = fileHandler.createFile(
        "export",
        dataStringInFile,
        "sequelize",
        exportPath,
        "tmpApp"
      );
      fileHandler.compressZip(
        exportFileName,
        location,
        [exportPrivatePath, exportPublicPath],
        exportPath,
        "export",
        res
      );
    }
  } catch (error) {
    console.log("ERROR EXPORT DATABASE", error);
    res.json({
      success: false,
      message: "Erreur dans l'exportation du base de données",
    });
  }
};

const importData = async (req, res) => {
  try {
    if (!req.files || req.files.length == 0)
      return res.json({ success: false, message: "Aucun fichier envoyer" });

    if (!req.files[0].originalname.includes(".zip"))
      return res.json({
        success: false,
        message: "Le fichier doit être un archive ZIP",
      });
    const { location, fileDir } = fileHandler.createFile(
      "import",
      req.files[0].buffer,
      "zip",
      importPath,
      "tmpApp"
    );
    const result = await fileHandler.decompressZip(location, fileDir, "import");
    res.json(result);
  } catch (error) {
    console.log("ERROR IMPORT DATABASE", error);
    res.json({
      success: false,
      message: "Erreur dans l'importation du base de données",
    });
  }
};

module.exports = { exportData, importData };
