const path = require("path");
const fs = require("fs");

const md5File = require("md5-file");
const COS = require("cos-nodejs-sdk-v5");

const { getAll, set } = require("./util/cache");

const cacheFile = ".cache/sdk-file-uploader.json";
const typeMap = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
const errorMessage = {
  "-2": "上传失败",
  "-1": "暂不支持此文件格式",
  0: "文件已在缓存列表",
  1: "上传成功",
};

class Akali {
  constructor(options = {}) {
    this.options = options;
    // 创建实例
    this.cos = new COS({
      SecretId: options.secretId,
      SecretKey: options.secretKey,
    });

    // 设置缓存地址
    this.cacheFile =
      options.cacheFile || path.resolve(process.cwd(), cacheFile);
    this.memoryCache = getAll(this.cacheFile);
  }
  saveCacheToFile() {
    clearTimeout(this.cacheTimer);
    this.cacheTimer = setTimeout(() => {
      set(this.memoryCache, this.cacheFile);
    }, 2000);
  }

  // 上传资产
  async cosPut(filekey, filePath) {
    try {
      const uploadResult = await this.cos.putObject({
        Bucket: this.options.bucket,
        Region: this.options.region,
        Key: filekey,
        Body: fs.createReadStream(filePath),
        ContentLength: fs.statSync(filePath).size,
        ACL: "public-read",
      });
      return {
        code: 1,
        success: true,
        message: errorMessage[1],
        data: this.options.domain
          ? `${this.options.domain}/${filekey}`
          : uploadResult.Location,
      };
    } catch (error) {
      return {
        code: error?.status || -2,
        success: false,
        message: error?.message || errorMessage[-2],
        data: error,
      };
    }
  }

  async upload(filePath, relativePath) {
    // 文件类型缩紧
    const ext = path.extname(filePath).toLowerCase().slice(1);
    if (!typeMap.includes(ext)) {
      return Promise.reject(
        new Error({
          code: -1,
          success: false,
          message: errorMessage[-1],
        })
      );
    }

    const md5 = md5File.sync(filePath);
    const key = `${md5}.${ext}`;
    // 缓存存在直接返回
    if (this.memoryCache[key]) {
      return Promise.resolve({
        code: 0,
        success: true,
        message: errorMessage[0],
        data: {
          md5,
          url: this.memoryCache[key],
        },
      });
    }

    const result = await this.cosPut(
      this.options?.relativePath ? relativePath : key,
      filePath
    );
    if (result?.success) {
      this.memoryCache[key] = result.data;
      this.saveCacheToFile();
      return Promise.resolve({
        code: 1,
        success: true,
        message: errorMessage[1],
        data: {
          md5,
          url: result.data,
        },
      });
    }
    return Promise.reject(new Error({ ...result }));
  }
}

module.exports = Akali;
