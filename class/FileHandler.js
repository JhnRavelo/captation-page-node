const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const fsExtra = require("fs-extra");
const AdmZip = require("adm-zip");
const archiver = require("archiver");
const util = require("util");
require("dotenv").config();
const importFileToDatabase = require("../utils/importFileToDatabase");
const generateDataJWT = require("../utils/generateDataJWT");
const generateRandomText = require("../utils/generateRandomText");
const createDataViaTmpFile = require("../utils/createDataViaTmpFile");

const readdir = util.promisify(fs.readdir);
const unlink = util.promisify(fs.unlink);

let zipEncryptedRegistered = false;

if (!zipEncryptedRegistered) {
  try {
    archiver.registerFormat("zip-encrypted", require("archiver-zip-encrypted"));
    zipEncryptedRegistered = true;
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement du format zip-encrypted :",
      error.message
    );
  }
}

class FileHandler {
  constructor() {
    const date = new Date();
    this.dateArray = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  }

  getDate() {
    const date = new Date();
    return `${
      date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds()
    }`;
  }

  createDirectory(dirPath, index) {
    if (
      fs.existsSync(path.join(dirPath, `${this.dateArray[index]}`)) &&
      index < this.dateArray.length
    ) {
      return this.createDirectory(
        path.join(dirPath, `${this.dateArray[index]}`),
        index + 1
      );
    } else if (
      !fs.existsSync(path.join(dirPath, `${this.dateArray[index]}`)) &&
      index < this.dateArray.length
    ) {
      fs.mkdirSync(path.join(dirPath, `${this.dateArray[index]}`), {
        recursive: true,
      });
      return this.createDirectory(
        path.join(dirPath, `${this.dateArray[index]}`),
        index + 1
      );
    } else {
      return dirPath;
    }
  }

  readDirectory(exportPath, filesArray = []) {
    const files = fs.readdirSync(exportPath);
    files.forEach((file) => {
      const filePath = path.join(exportPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        this.readDirectory(filePath, filesArray);
      } else {
        filesArray.push(filePath);
      }
    });
    return filesArray;
  }

  createFile(fileName, data, ext, filePath, type) {
    let name = Buffer.from(
        fileName
          .slice(0, 30)
          .replace(/,/g, "")
          .replace(/public/g, "")
          .replace(/ /g, "-"),
        "latin1"
      ).toString("utf8"),
      fileDir,
      location;
    const date = `-${this.getDate()}.`;
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    if (type == "tmpApp") {
      name = fileName + "." + ext;
      fileDir = filePath;
      location = path.join(filePath, name);
    } else {
      name = fileName + date + ext;
      fileDir = this.createDirectory(filePath, 0);
      if (type == "public") {
        const publicPath = path.join(fileDir, name).split("public")[1];
        location = `${
          process.env?.SERVER_PATH ? process.env.SERVER_PATH : ""
        }${publicPath.replace(/\\/g, "/")}`;
      } else location = path.join(fileDir, name);
    }
    fs.writeFileSync(path.join(fileDir, name), data, {
      encoding: "utf8",
      flag: "w",
    });
    return { fileDir, location, date };
  }

  async createImage(files, imgPath, ext, type) {
    const galleryArray = new Array();
    const response = files.map(async (file) => {
      if (file.mimetype.split("/")[0] == "image") {
        let webpData;
        if (ext == "webp") {
          webpData = await sharp(file.buffer).webp().toBuffer();
        } else webpData = file.buffer;
        const { location } = this.createFile(
          file.originalname.split(".")[0],
          webpData,
          ext == "webp"
            ? ext
            : file.originalname.split(".")[
                file.originalname.split(".").length - 1
              ],
          imgPath,
          type
        );
        galleryArray.push(location);
      }
    });
    await Promise.all(response);
    return galleryArray.join(",");
  }

  deleteFileFromDatabase(deleted, dirPath, type) {
    const filePath = this.getFilePath(deleted, dirPath, type);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getFilePath(deleted, dirPath, type, level) {
    const location =
      deleted.split(type).length > 2
        ? deleted.split(type).slice(1).join(type)
        : deleted.split(type)[1];
    let filePath = path.join(dirPath, location);

    if (level == "private") {
      filePath = "/public/" + type + location;
    }

    return filePath;
  }

  async compressZip(
    fileName,
    filePath,
    directory,
    outputPath,
    outputName,
    res
  ) {
    const output = fs.createWriteStream(
      path.join(outputPath, outputName + ".zip")
    );
    const archive = archiver.create("zip-encrypted", {
      zlib: { level: 8 },
      encryptionMethod: process.env.ZIP_METHOD,
      password: process.env.ZIP_PASSWORD,
    });
    output.on("close", function () {
      console.log(archive.pointer() + " total bytes");
      return res.download(output.path);
    });
    output.on("end", function () {
      console.log("Erreur compression, les données ont été drainé");
      return res.json({
        success: false,
        message: "Erreur compression, les données ont été drainé",
      });
    });
    archive.on("warning", function (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Erreur compression, Attention problème de système de fichier",
      });
    });
    archive.on("error", function (err) {
      console.log(err);
      return res.json({ success: false, message: "Erreur compression" });
    });
    archive.pipe(output);

    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: fileName });
    }

    if (fs.existsSync(directory)) {
      archive.directory(directory, false);
    }
    archive.finalize();
  }

  extractZipAsync(zipFilePath, destinationPath) {
    return new Promise((resolve, reject) => {
      const zip = new AdmZip(zipFilePath);
      try {
        zip.extractAllTo(
          destinationPath,
          true,
          false,
          process.env.ZIP_PASSWORD
        );
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async decompressZip(zipPath, dirPath, action) {
    try {
      const publicPath = path.join(__dirname, "..", "public");
      const outputPath = path.join(dirPath, "/import");
      await this.extractZipAsync(zipPath, outputPath);
      let result = {
        success: true,
        message: "Succès de l'importation de la base de données",
      };
      const files = fs.readdirSync(outputPath);
      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(outputPath, file);
          if (file.includes(".sequelize")) {
            const isImport = await importFileToDatabase(filePath);
            if (!isImport) {
              result.success = false;
              result.message = "Importation de la base de données échouée";
            }
          } else if (!file.includes(".zip")) {
            const assetDIr = path.join(publicPath, file);
            if (fs.existsSync(assetDIr)) {
              await fsExtra.remove(assetDIr);
            }
            await fsExtra.copy(filePath, assetDIr);
          }
          return result;
        })
      );
      if (action != "restore") {
        fs.unlinkSync(zipPath);
      }
      fsExtra.remove(outputPath);
      return result;
    } catch (error) {
      console.log("DECOMPRESS ERROR", error);
      if (action != "restore") {
        fs.unlinkSync(zipPath);
      }
      fsExtra.remove(outputPath);
      return {
        success: false,
        message: "Erreur lors de l'extraction du fichier ZIP",
      };
    }
  }

  async generateData(data, filePath) {
    try {
      if (data && data.length > 0) {
        const stringDataUser = generateDataJWT(data);
        const files = await readdir(filePath);
        const tempFile = files.find((item) => item.includes(".tmp"));
        if (tempFile) {
          await unlink(path.join(filePath, tempFile));
        }
        const { location } = this.createFile(
          generateRandomText(10),
          stringDataUser,
          "tmp",
          filePath,
          "tmpApp"
        );
        if (!location) {
          console.log("ERROR CREATE FILE");
          return;
        }
      } else {
        const files = await readdir(filePath);
        const tempFile = files.find((item) => item.includes(".tmp"));
        if (tempFile) {
          await createDataViaTmpFile(path.join(filePath, tempFile));
        }
      }
    } catch (err) {
      console.log("ERROR", err);
    }
  }
}

module.exports = FileHandler;
