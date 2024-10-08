const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const fsExtra = require("fs-extra");
const AdmZip = require("adm-zip");
const archiver = require("archiver");
require("dotenv").config();
const importFileToDatabase = require("../utils/importFileToDatabase");
const generateDataJWT = require("../utils/generateDataJWT");
const generateRandomText = require("../utils/generateRandomText");
const createDataViaTmpFile = require("../utils/createDataViaTmpFile");
const removeDatabaseByUser = require("../utils/removeDatabaseByUser");
const { databaseArrays } = require("../lib/databaseDatas");

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
    this.privatePath = path.join(__dirname, "..", "private");
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
          .replace(/private/g, "")
          .replace(/ /g, "-"),
        "latin1"
      ).toString("utf8"),
      fileDir,
      location;
    const date = `-${this.getDate()}.`;
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
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
      } else if (type == "private") {
        const privatePath = path.join(fileDir, name).split("private")[1];
        location = "/private" + privatePath.replace(/\\/g, "/");
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

  async copyFile(arrays, filePath, outputPath, user) {
    const standardPath = filePath.replace(/\\/g, "/");
    const type = standardPath.split("/")[standardPath.split("/").length - 1];

    try {
      const readDirs = fs.readdirSync(filePath);

      await Promise.all(
        readDirs
          .filter((folder) => folder != "index.html" && folder != "assets")
          .map(async (folder) => {
            if (folder === "mail") {
              let rootPath = path.join(outputPath, type, folder);

              if (user) rootPath = path.join(rootPath, "user_" + user);

              if (!fs.existsSync(rootPath)) {
                fs.mkdirSync(rootPath, { recursive: true });
              }

              if (user) {
                await fsExtra.copy(
                  path.join(filePath, folder, "user_" + user),
                  rootPath,
                  { overwrite: true }
                );
              } else
                await fsExtra.copy(path.join(filePath, folder), rootPath, {
                  overwrite: true,
                });
            } else {
              if (user) {
                const rootPath = path.join(outputPath, type, "user_" + user);

                if (!fs.existsSync(rootPath)) {
                  fs.mkdirSync(rootPath, { recursive: true });
                }
                await fsExtra.copy(path.join(filePath, folder), rootPath, {
                  overwrite: true,
                });
              } else if (arrays.length > 0) {
                await Promise.all(
                  arrays.map(async (array) => {
                    const rootPath = path.join(outputPath, type, folder, array);

                    if (!fs.existsSync(rootPath)) {
                      fs.mkdirSync(rootPath, { recursive: true });
                    }

                    if (user && folder != "user_" + user) {
                      return;
                    } else {
                      await fsExtra.copy(
                        path.join(filePath, folder, array),
                        rootPath,
                        { overwrite: true }
                      );
                    }
                  })
                );
              } else {
                const rootPath = path.join(outputPath, type);

                if (!fs.existsSync(rootPath)) {
                  fs.mkdirSync(rootPath, { recursive: true });
                }
                await fsExtra.copy(filePath, rootPath, { overwrite: true });
              }
            }
          })
      );
    } catch (error) {
      console.error("Error while copying files:", error);
    }
  }

  async removeDirectories(arrays, filePath, user) {
    const readDirs = fs.readdirSync(filePath);
    const standardPath = filePath.replace(/\\/g, "/");
    const type = standardPath.split("/")[standardPath.split("/").length - 1];

    if (user) {
      let removedDir;
      if (type == "private") {
        removedDir = path.join(filePath, "user_" + user);
      } else removedDir = path.join(filePath, "mail", "user_" + user);
      if (fs.existsSync(removedDir)) {
        await fsExtra.remove(removedDir);
      }
    } else {
      await Promise.all(
        readDirs.map(async (folder) => {
          if (arrays.length > 0) {
            await Promise.all(
              arrays.map(async (array) => {
                const removedDir = path.join(filePath, folder, array);
                if (fs.existsSync(removedDir)) {
                  await fsExtra.remove(removedDir);
                }
              })
            );
          } else if (type == "public" && folder != "mail") {
            return;
          } else {
            const removedDir = path.join(filePath, folder);
            if (fs.existsSync(removedDir)) {
              await fsExtra.remove(removedDir);
            }
          }
        })
      );
    }
  }

  getFilePath(deleted, dirPath, type) {
    const location =
      deleted.split(type).length > 2
        ? deleted.split(type).slice(1).join(type)
        : deleted.split(type)[1];
    const filePath = path.join(dirPath, location);

    return filePath;
  }

  async compressZip(
    fileName,
    filePath,
    directories,
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
      if (res) {
        const readOutputs = fs.readdirSync(outputPath);
        readOutputs.forEach(async (file) => {
          const outputFilePath = path.join(outputPath, file);
          if (fs.existsSync(outputFilePath) && !file.endsWith(".zip")) {
            await fsExtra.remove(outputFilePath);
          }
        });
        res.download(output.path);
        res.on("finish", async () => {
          try {
            await fsExtra.remove(output.path);
            console.log("Fichier effacer: ", output.path);
          } catch (error) {
            console.error(
              "Erreur effacement du fichier: " + output.path,
              error
            );
          }
        });
      } else return;
    });
    output.on("end", function () {
      console.log("Erreur compression, les données ont été drainé");
      if (res) {
        return res.json({
          success: false,
          message: "Erreur compression, les données ont été drainé",
        });
      } else return;
    });
    archive.on("warning", function (err) {
      console.log("Erreur warning", err);
      if (res) {
        return res.json({
          success: false,
          message:
            "Erreur compression, Attention problème de système de fichier",
        });
      } else return;
    });
    archive.on("error", function (err) {
      console.log("Erreur compression", err);
      if (res) {
        return res.json({ success: false, message: "Erreur compression" });
      } else return;
    });
    archive.pipe(output);

    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: fileName });
    }
    directories.map((directory) => {
      if (fs.existsSync(directory)) {
        archive.directory(directory, false);
      }
    });
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

  async decompressZip(zipPath, dirPath, action, user) {
    const outputPath = path.join(dirPath, "/import");
    try {
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
            if (user) {
              await removeDatabaseByUser(databaseArrays, user);
              await createDataViaTmpFile(filePath);
            } else {
              const isImport = await importFileToDatabase(filePath);
              if (!isImport) {
                result.success = false;
                result.message = "Importation de la base de données échouée";
              }
            }
          } else if (!file.includes(".zip")) {
            if (user) {
              await this.removeDirectories(
                [],
                path.join(__dirname, "..", file),
                user
              );
            } else
              await this.removeDirectories(
                [],
                path.join(__dirname, "..", file)
              );
            await fsExtra.copy(filePath, path.join(__dirname, "..", file), {
              overwrite: true,
            });
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
      if (data) {
        const stringDataUser = generateDataJWT(data);
        await this.removeDirectories([], filePath);
        const { location } = this.createFile(
          generateRandomText(10),
          stringDataUser,
          "tmp",
          filePath,
          "tmpApp"
        );
        await this.copyFile(
          ["avatar", "entreprise", "logo"],
          this.privatePath,
          filePath
        );
        if (!location) {
          console.log("ERROR CREATE FILE");
          return;
        }
      } else {
        await this.removeDirectories(
          ["avatar", "entreprise", "logo"],
          this.privatePath
        );
        await this.copyFile(
          [],
          path.join(filePath, "private"),
          path.join(__dirname, "..")
        );
        const files = fs.readdirSync(filePath);
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
