const OSS = require("ali-oss");

/**
 * @description: OSS初始化所需参数
 * @param {string} region
 * @param {string} accessKeyId
 * @param {string} accessKeySecret
 * @param {string} bucket
 */
class ALIOSS {
  constructor(opts = {}) {
    this.config = opts;

    // 实例化oss
    this.client = new OSS({
      accessKeyId: opts.secretId,
      accessKeySecret: opts.secretKey,
      // 存储桶的名称
      bucket: opts.bucket,
      // 存储桶所在地域
      region: opts.region,
    });
  }

  async put(name, file, options = {}) {
    try {
      const res = await this.client.put(name, file, {
        headers: {
          // 是否允许覆盖同名Object
          "x-oss-forbid-overwrite": false,
          // 访问权限
          "x-oss-object-acl": "public-read",
        },
        // NOTE: 拓展参数,支持put第三个options的所有配置（function除外）
        ...options,
      });
      return Promise.resolve({
        code: 200,
        success: true,
        message: "上传成功",
        data: {
          url: this.config.domain
            ? `${this.config.domain}/${res.name}`
            : res.url,
        },
      });
    } catch (error) {
      return Promise.reject({
        success: false,
        coe: error?.status,
        message: error?.message,
      });
    }
  }
}

exports.default = ALIOSS;
