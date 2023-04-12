const fs = require("fs");

const COS = require("cos-nodejs-sdk-v5");

/**
 * @description: COS初始化所需参数
 * @param {string} SecretId
 * @param {string} SecretKey
 */
class TCCOS {
  constructor(opts = {}) {
    this.config = opts;

    // 实例化cos
    this.client = new COS({
      SecretId: opts.secretId,
      SecretKey: opts.secretKey,
    });
  }

  async put(name, file, options = {}) {
    try {
      const fileBody = fs.createReadStream(file);
      const fileSize = fs.statSync(file).size;
      const res = await this.client.putObject({
        // NOTE: 拓展参数，支持putObject所有配置（function除外）
        ...options,
        // 要上传对象内容
        Body: fileBody,
        // 上传的文件大小
        ContentLength: fileSize,
        // 访问权限
        ACL: "public-read",
        // 存储桶的名称
        Bucket: this.config.bucket,
        // 存储桶所在地域
        Region: this.config.region,
        // 请求的对象键
        Key: name,
      });
      return Promise.resolve({
        code: 200,
        success: true,
        message: "上传成功",
        url: this.options.domain
          ? `${this.options.domain}/${name}`
          : res.Location,
      });
    } catch (error) {
      console.log("🚀 ~ file: cos.js:45 ~ TCCOS ~ put ~ error:", error);
      return Promise.reject({
        code: error?.statusCode,
        success: false,
        message: error?.message,
      });
    }
  }
}

exports.default = TCCOS;
