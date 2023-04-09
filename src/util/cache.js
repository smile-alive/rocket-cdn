const fs = require("fs");
const path = require("path");

const mkdirp = require("mkdirp");

function getAll(cacheFilePath) {
  return get("", cacheFilePath);
}

function get(key, cacheFilePath) {
  let map = {};
  try {
    if (fs.existsSync(cacheFilePath)) {
      const content = fs.readFileSync(cacheFilePath, { encoding: "utf-8" });
      map = JSON.parse(content);
    }
  } catch (e) {
    /* empty */
  }
  return key ? map[key] : map;
}

function set(key, cacheFilePath) {
  let map = {};
  try {
    if (fs.existsSync(cacheFilePath)) {
      const content = fs.readFileSync(cacheFilePath, { encoding: "utf-8" });
      map = JSON.parse(content);
    } else {
      mkdirp.sync(path.dirname(cacheFilePath));
    }
    map = { ...map, ...key };
    fs.writeFileSync(cacheFilePath, JSON.stringify(map, null, 2));
  } catch (e) {
    /* empty */
  }
}

module.exports = {
  getAll,
  get,
  set,
};
