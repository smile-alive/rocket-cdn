const path = require("path");

const { validate } = require("schema-utils");
const { getHashDigest } = require("loader-utils");
const colors = require("colors");
const logger = require("webpack-log");

const schema = require("./schema.json");
const Akali = require("./akali");

const LOADER_NAME = "ROCKET-CDN";
const log = logger({
  name: LOADER_NAME,
  level: "info",
});
colors.setTheme({
  success: ["green", "bold", "italic"],
  error: ["red", "bold", "italic", "strikethrough"],
});

/**
 * uploadCache为上传队列。使用fileMd5做为key，将上传方法缓存。
 * 单一promise执行完不会再重复执行，而后面同样key的上传，直接调用该缓存的then方法即可。
 * 单次运行该缓存生效，进程结束缓存归零。
 */
const uploadCache = new Map();
let akali;

// 实例化Akali对象
function createAkali(opts) {
  if (!akali) {
    akali = new Akali({ ...opts });
  }
  return akali;
}

/**
 * @description: loader接收参数描述
 * @param {string} secretId - secretId
 * @param {string} secretKey - secretKey
 * @param {string} bucket - 存储桶的名称
 * @param {string} region - 存储桶所在地域
 * @param {string} ossType - 存储对象平台
 * @param {string} domain - 自定义域名
 * @param {boolean} origPath - 是否使用原始路径
 * @param {boolean} overwrite - 是否使用缓存
 * @param {object} headers - 请求头信息
 */
module.exports = function RocketCdn(source) {
  // 获取params参数
  const options = this.query || {};
  const callback = this.async();

  // 校验参数
  validate(schema, options, { name: LOADER_NAME, baseDataPath: "options" });
  // 实例化Akali对象
  createAkali(options);

  // 获取资源文件的路径
  const filePath = this.resourcePath;
  const srcPath = this.rootContext;
  // 获取文件的相对路径
  const origPath = path.relative(srcPath, filePath);
  const fileMd5 = getHashDigest(source, "md5");

  // 将上传方法缓存到uploadQueue中
  if (!uploadCache.has(fileMd5)) {
    uploadCache.set(fileMd5, akali.upload(filePath, origPath));
  }

  // 直接使用缓存的promise
  uploadCache
    .get(fileMd5)
    .then(({ data }) => {
      log.info(`${colors.cyan(filePath)} -> ${colors.success(data.url)}`);
      const baseUrl = `module.exports = '${data.url}';`;
      callback(null, baseUrl);
    })
    .catch((error) => {
      throw new Error(
        JSON.stringify({ ...error, filename: filePath }, null, 2)
      );
    });
};
