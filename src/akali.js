const path = require("path");

const md5File = require("md5-file");

const { getAll, set } = require("./util/cache");
const filtr = require("./util/filtr");
const TCCOS = require("./service/cos");
const ALIOSS = require("./service/oss");

const CACHE_ADDRESS = ".cache/sdk-file-uploader.json";
const FILE_TYPE = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

const ClassMap = {
  tc: TCCOS,
  ali: ALIOSS,
};

class Akali {
  constructor(options = {}) {
    this.options = { origPath: false, headers: {}, ...options };
    // NOTE: 根据 ossType 选项实例化相应的类
    // eslint-disable-next-line new-cap
    this.oss = new ClassMap[options.ossType].default({ ...options });
    // 设置缓存地址
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
    // 文件类型缩紧
    const ext = path.extname(filePath).toLowerCase().slice(1);
    if (!FILE_TYPE.includes(ext)) {
      return Promise.reject({
        code: 400,
        success: false,
        message: "暂不支持此文件格式",
      });
    }

    // file rename
    const md5 = md5File.sync(filePath);
    const key = `${md5}.${ext}`;
    // 缓存存在直接返回
    if (this.cacheContent[key]) {
      return Promise.resolve({
        code: 300,
        success: true,
        message: "文件已在缓存列表",
        data: {
          url: this.cacheContent[key],
        },
      });
    }

    // 过滤掉所有的函数类型属性
    const opts = filtr(this.options.headers);
    // 判断使用md5转码后的文件名
    const result = await this.oss.put(
      this.options.origPath ? origPath : key,
      filePath,
      opts
    );
    if (result.success) {
      this.cacheContent[key] = result.url;
      this.saveCacheToFile();
      return Promise.resolve({
        code: 200,
        success: true,
        message: "上传成功",
        data: {
          url: result.url,
        },
      });
    }
    return Promise.reject({ ...result });
  }
}

module.exports = Akali;
