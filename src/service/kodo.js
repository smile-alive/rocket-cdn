const qiniu = require("qiniu");

/**
 * @description: Kodo初始化所需参数
 * @param {string} accessKey
 * @param {string} secretKey
 * @param {string} bucket
 * @param {string} zone
 */
class QINIU {
  constructor(opts = {}) {
    this.options = opts;

    // 初始化配置
    this.config = new qiniu.conf.Config();
    this.config.zone = qiniu.zone[opts.region];

    // 设置账户信息
    this.mac = new qiniu.auth.digest.Mac(opts.secretId, opts.secretKey);
    this.formUploader = new qiniu.form_up.FormUploader(this.config);
    this.putExtra = new qiniu.form_up.PutExtra();
  }

  put(name, file, options = {}) {
    return new Promise((resolve, reject) => {
      const putPolicy = new qiniu.rs.PutPolicy({
        ...options,
        // 强制覆盖同名文件
        force: 1,
        scope: `${this.options.bucket}:${name}`,
      });
      const uploadToken = putPolicy.uploadToken(this.mac);

      this.formUploader.putFile(
        uploadToken,
        name,
        file,
        this.putExtra,
        (error, respBody, respInfo) => {
          if (error) {
            return reject({
              success: false,
              error,
            });
          }
          if (respInfo.statusCode !== 200) {
            return reject({
              success: false,
              code: respInfo.statusCode,
              message: JSON.parse(respBody.error),
            });
          }
          return resolve({
            success: true,
            code: 200,
            message: "上传成功",
            data: {
              url: `${this.options.domain}/${respBody.key}`,
            },
          });
        }
      );
    });
  }
}
exports.default = QINIU;
