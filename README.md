# rocket-cdn

`rocket-cdn` 是一个用来处理项目中图片资源上传至云端的库。它可以让开发者将图片上传至云端存储，并返回可被使用的 CDN 地址以替代本地引用。

## 示例

```jsx
// 打包前
<img mode='aspectFit' src='../static/image/放大镜.png' />

// 打包后
<img mode='aspectFit' src='https://sylas-image.vhhg.site/825c5a02f69c8022d24e8f3b07e95323.png' />

// origPath开启后
<img mode='aspectFit' src='https://sylas-image.vhhg.site/src/static/image/放大镜.png' />
```

## 特性

- 开箱即用：只需安装并配置少量选项，即可在项目中轻松使用。
- 自由配置项：该库支持许多自定义选项，可根据实际需求进行配置。
- 支持多种云端存储服务：包括 [Tencent Cloud Object Storage (COS)](https://cloud.tencent.com/document/product/436/8629) 和 [Alibaba Cloud OSS](https://help.aliyun.com/document_detail/111256.html?spm=a2c4g.32067.0.0.66ab7dbbR3jFsQ)。

## 安装

```bash
npm install rocket-cdn -D
```

或者使用 `yarn`：

```bash
yarn add rocket-cdn -D
```

## 用法

### 配置项

使用 `rocket-cdn` 时，需要提供以下选项：

|   参数    |   类型   | 必填项 |                                        描述                                        |
| :-------: | :------: | :----: | :--------------------------------------------------------------------------------: |
| secretId  |  string  |   是   |                                      SecretId                                      |
| secretKey |  string  |   是   |                                     secretKey                                      |
|  bucket   |  string  |   是   |                                    存储桶的名称                                    |
|  region   |  string  |   是   |                                   存储桶所在地域                                   |
|  ossType  | ali / tc |   是   |                                    存储对象平台                                    |
|  domain   |  string  |   否   |                                     自定义域名                                     |
| origPath  | boolean  |   否   |                        是否使用图片原始路径，默认为 `false`                        |
| overwrite | boolean  |   否   |                            是否使用缓存，默认为 `false`                            |
|  headers  |  object  |   否   | 拓展参数，支持 OSS 上传方法所有配置（`function` 除外）<br />具体信息可参考官方文档 |

`rocket-cdn`会在项目中创建一个`.cache/file-upload-log.json`文件，用于记录已上传的文件。当再次启动项目时，它会根据此文件来判断是否需要重新调用 oss 的上传服务。如果您想覆盖这个判断阶段，您可以使用`overwrite`选项。此时，json 文件将仅用作记录日志的工具。"

### webpack 使用

在 webpack 中使用 `rocket-cdn` 的示例：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "rocket-cdn",
            options: {
              secretId: "",
              secretKey: "",
              bucket: "",
              region: "",
              ossType: "tc",
              domain: "",
              origPath: false,
              headers: {},
            },
          },
        ],
      },
    ],
  },
};
```

### webpack-chain 使用

在 `webpack-chain` 中使用 `rocket-cdn` 的示例：

```js
webpackChain(chain) {
  chain.module
    .rule('image')
    .test(/\.(png|jpe?g|gif)$/i)
    .use('rocket-cdn')
    .loader('rocket-cdn')
    .options({
        secretId: '',
        secretKey: '',
        bucket: '',
        region: '',
        ossType: 'tc',
        domain: '',
        origPath: false,
        headers:{}
    })
    .end();
}
```

### 补充：

- 在 taro 中使用需要前置清除 url-loader 的默认配置（webpack4-5）
- 经测试 webpack5 的 css 中别名路径替换异常 => [isues](https://github.com/NervJS/taro/issues/13595)

```js
const config = {
  mini: {
    postcss: {
      url: {
        enable: false,
        config: {
          limit: 10240
        }
      },
    },
    imageUrlLoaderOption: {
      limit: false,
    },
    webpackChain(chain) {
      chain.module.rules.delete('image');
      // rocket-cdn loader config⬇️
    }
  };
```

## 代办项

- [x] GitHub Actions tags 发版
- [x] 腾讯云接入
- [x] 阿里云接入
- [ ] 七牛云接入
- [ ] 项目升级为 ts
