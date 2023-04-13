const path = require("path");

const md5File = require("md5-file");

const { getAll, set } = require("./util/cache");
const filtr = require("./util/filtr");
const TCCOS = require("./service/cos");
const ALIOSS = require("./service/oss");

const CACHE_ADDRESS = ".cache/file-upload-log.json";
const FILE_TYPE = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

const ClassMap = {
  tc: TCCOS,
  ali: ALIOSS,
};

class Akali {
  constructor(options = {}) {
    // 设置默认值
    this.options = {
      origPath: false,
      overwrite: true,
      headers: {},
      ...options,
    };
    // NOTE: 根据 ossType 选项实例化相应的类
    // eslint-disable-next-line new-cap
    this.oss = new ClassMap[options.ossType].default({ ...options });
    // 设置缓存日志地址
    this.cacheAddress = path.resolve(process.cwd(), CACHE_ADDRESS);
    this.cacheContent = getAll(this.cacheAddress);
  }

  saveCacheToFile() {
    clearTimeout(this.cacheTimer);
    this.cacheTimer = setTimeout(() => {
      set(this.cacheContent, this.cacheAddress);
    }, 2000);
  }

  async upload(filePath, origPath) {
    try {
      // 文件类型缩紧
      const ext = path.extname(filePath).toLowerCase().slice(1);
      if (!FILE_TYPE.includes(ext)) {
        return Promise.reject({
          success: false,
          code: 400,
          message: "暂不支持此文件格式",
        });
      }

      // file rename
      const md5 = md5File.sync(filePath);
      const key = `${md5}.${ext}`;
      // NOTE: 日志存在说明该上传过，直接取用缓存地址
      if (this.cacheContent[key] && this.options.overwrite) {
        return Promise.resolve({
          success: true,
          code: 300,
          message: "文件已在缓存列表",
          data: {
            url: this.cacheContent[key],
          },
        });
      }

      // 过滤掉所有的函数类型属性
      const opts = filtr(this.options.headers);
      // 判断是否使用md5转码后的文件名
      const result = await this.oss.put(
        this.options.origPath ? origPath : key,
        filePath,
        opts
      );
      if (result.success) {
        this.cacheContent[key] = result.data.url;
        this.saveCacheToFile();
        return Promise.resolve({ ...result });
      }
      return Promise.reject({ ...result });
    } catch (error) {
      return Promise.reject({ ...error });
    }
  }
}

module.exports = Akali;
