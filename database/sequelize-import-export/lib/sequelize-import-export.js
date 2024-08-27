"use strict";

const fs = require("fs");
const generateDataJWT = require("../../../utils/generateDataJWT");
const jwt = require("jsonwebtoken");
class SequelizeIE {
  constructor(models = []) {
    this._models = [];
    for (let m in models) {
      if (models[m] && models[m].build) {
        let m_ = models[m].build();
        if (models[m].name && models[m].name.length) {
          this._models[models[m].name] = models[m];
        }
      }
    }

    this.import = this.import.bind(this);
    this.export = this.export.bind(this);
  }

  import(dir, options = { overwrite: false, excludes: [""] }) {
    if (!dir)
      throw new Error("Please Specify a Directory to place the export file");
    return new Promise((resolve, reject) => {
      let dataModels = [];
      try {
        fs.readFile(dir, { encoding: "utf8" }, (err, data) => {
          if (err) reject(err);
          jwt.verify(data, process.env.DATA_TOKEN, async (err, decoded) => {
            if (err) reject(err);
            dataModels = JSON.parse(decoded.data);
            (async () => {
              for (let m in this._models) {
                let tmpModel = dataModels.find((mod) => mod.modelName == m);
                if (
                  tmpModel &&
                  tmpModel.data.length > 0 &&
                  !options.excludes.find((item) => item == tmpModel.modelName)
                ) {
                  if (options.overwrite) {
                    await this._models[m].destroy({
                      where: {},
                      truncate: { cascade: true },
                    });
                  }

                  tmpModel.data.map(async (row) => {
                    try {
                      await this._models[m].create(row);
                    } catch (err) {
                      reject(err);
                    }
                  });
                }
              }
              resolve();
            })();
          });
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  export(dir, options = { excludes: [""] }) {
    if (!dir)
      throw new Error("Please Specify a Directory to place the export file");

    return new Promise((resolve, reject) => {
      try {
        (async () => {
          let exportData = [];
          for (let m in this._models) {
            if (!options.excludes.find((item) => item == m)) {
              let tmpData = await this._models[m].findAll({ paranoid: false });
              if (tmpData) {
                tmpData = JSON.parse(JSON.stringify(tmpData));
              }
              let tmpobj = {
                modelName: m,
                data: tmpData || [],
              };
              exportData.push(tmpobj);
            }
          }
          fs.writeFile(dir, generateDataJWT(exportData), (err) => {
            if (err) reject(err);
            else resolve(dir);
          });
        })();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = SequelizeIE;
