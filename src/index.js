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
 * uploadQueue为上传队列。使用fileMd5做为key，将上传方法缓存。
 * 单一promise执行完不会再重复执行，而后面同样key的上传，直接调用该缓存的then方法即可。
 * 单次运行该缓存生效，进程结束缓存归零。
 */
const uploadQueue = new Map();
let akali;

// 引入参数校验规则，防止与其他模块产生命名冲突
function validateOptions(opts) {
  const cacheKey = JSON.stringify(opts);
  if (validateOptions.cache[cacheKey]) {
    return validateOptions.cache[cacheKey];
  }
  const result = validate(schema, opts, {
    name: LOADER_NAME,
    baseDataPath: "options",
  });
  validateOptions.cache[cacheKey] = result;
  return result;
}
// 定义参数校验结果缓存对象
validateOptions.cache = {};

// 实例化Akali对象
function createAkali(opts) {
  if (!akali) {
    akali = new Akali({ ...opts });
  }
  return akali;
}

/**
 * @description: loader接收参数描述
 * @param {*} secretId 	cos的SecretId
 * @param {*} secretKey secretKey
 * @param bucket 		存储桶的名称
 * @param region 		存储桶所在地域
 * @param domain 		请求域名
 * @param cacheFile 	缓存文件路径（防止重复上传）
 * @param relativePath 	是否使用md5作为文件名称
 */
module.exports = function loader(source) {
  // 获取params参数
  const options = this.query || {};
  const callback = this.async();

  // 校验参数
  validateOptions(options);

  // 实例化Akali对象
  createAkali(options);

  // 获取资源文件的路径
  const filePath = this.resourcePath;
  const srcPath = this.rootContext;
  // 获取文件的相对路径
  const relativePath = path.relative(srcPath, filePath);

  const fileMd5 = getHashDigest(source, "md5", "hex", 8);

  // 将上传方法缓存到uploadQueue中
  if (!uploadQueue.has(fileMd5)) {
    uploadQueue.set(fileMd5, akali.upload(filePath, relativePath));
  }

  // 直接使用缓存的promise
  uploadQueue
    .get(fileMd5)
    .then(({ data }) => {
      log.info(`${colors.cyan(filePath)} -> ${colors.success(data.url)}`);
      const baseUrl = `module.exports = '${data.url}';`;
      callback(null, baseUrl);
    })
    .catch((error) => {
      throw new Error(
        JSON.stringify({ message: error.message, filename: filePath }, null, 2)
      );
    });
};
