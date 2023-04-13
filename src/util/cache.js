const fs = require("fs");
const path = require("path");

const mkdirp = require("mkdirp");

/**
 * @description: 获取所有缓存数据
 * @param {string} cacheFilePath - 缓存文件路径
 * @returns {object} - 返回缓存数据对象
 */
function getAll(cacheFilePath) {
  return get("", cacheFilePath);
}

/**
 * @description: 获取指定键名的缓存数据
 * @param {string} key - 缓存数据的键名
 * @param {string} cacheFilePath - 缓存文件路径
 * @returns {any} - 返回对应的缓存数据值，如果未指定键名则返回整个缓存数据对象
 */
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

/**
 * @description: 设置缓存数据
 * @param {object} data - 需要设置的缓存数据对象
 * @param {string} cacheFilePath - 缓存文件路径
 */
function set(data, cacheFilePath) {
  let map = {};
  try {
    if (fs.existsSync(cacheFilePath)) {
      const content = fs.readFileSync(cacheFilePath, { encoding: "utf-8" });
      map = JSON.parse(content);
    } else {
      // NOTE: 如果缓存目录不存在则创建该目录
      mkdirp.sync(path.dirname(cacheFilePath));
    }
    map = { ...map, ...data };
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
