# rocket-cdn

`rocket-cdn` 是一个用来处理项目中图片资源上传至云端的库。它可以让开发者将图片上传至云端存储，并返回可被使用的 CDN 地址以替代本地引用。

<img src="https://i.328888.xyz/2023/04/16/iEte1p.jpeg" alt="iEte1p.jpeg" style="zoom:;" />

## 示例

在打包前，我们通常这样引用本地图片：

```jsx
<img src='../../static/image/mona-loading-default.gif' />
// or
<img src='@static/image/mona-loading-default.gif' />
```

使用 `rocket-cdn` 之后，项目打包会将图片转换为以下内容：

```jsx
<img src="https://image-1307877784.cos.ap-beijing.myqcloud.com/tc%3Ac502cd01c910b4f53d8603d6bd078ff.gif" />
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

|    参数    |       类型       | 默认值 | 必填项 |                                        描述                                        |
| :--------: | :--------------: | :----: | :----: | :--------------------------------------------------------------------------------: |
|  secretId  |      string      |        |   是   |                                      secretId                                      |
| secretKey  |      string      |        |   是   |                                     secretKey                                      |
|   bucket   |      string      |        |   是   |                                    存储桶的名称                                    |
|   region   |      string      |        |   是   |                                   存储桶所在地域                                   |
|  ossType   | ali / tc / qiniu |        |   是   |                                    存储对象平台                                    |
|   domain   |      string      |        |   否   |              自定义域名（请确保上传目标桶已绑定该域名，否则无法回显）              |
| customPath | boolean / string | false  |   否   |                                     自定义路径                                     |
| overwrite  |     boolean      |  true  |   否   |                            是否使用缓存，默认为 `true`                             |
|  headers   |      object      |   {}   |   否   | 拓展参数，支持 OSS 上传方法所有配置（`function` 除外）<br />具体信息可参考官方文档 |

#### overwrite

`rocket-cdn`会在项目中创建一个`.cache/file-upload-log.json`文件，用于记录已上传的文件。当再次启动项目时，它会根据此文件来判断是否需要重新调用 oss 的上传服务。如果您想覆盖这个判断阶段，您可以使用`overwrite`选项。此时，json 文件将仅用作记录日志的工具。

#### customPath

`customPath` 字段用于指定文件上传时的自定义路径。您可以根据需求设置以下三种方式中的一个：

- 默认初始路径是存储桶的根目录，文件名为 `md`。如果您不需要更改默认路径，则无需在请求中包含此字段。
- 如果您希望使用文件的相对路径作为初始目录，则需要将 `customPath` 设置为 `true`。这将确保文件被存储在与其本地路径相对应的路径下。
- 您还可以通过将 `customPath` 设置为字符串来指定自定义的初始路径。请注意，该路径必须是一个合法的字符串，并且必须指定为绝对路径或相对路径。

---

设置 `customPath: flase` 来保留图片的初始路径（即相对路径）：

```jsx
<img src="https://image-1307877784.cos.ap-beijing.myqcloud.com/src/static/image/mona-loading-default.gif" />
```

设置 `customPath: 'dev-static/' ` 来指定文件上传时的目录：

```jsx
<img src="https://image-1307877784.cos.ap-beijing.myqcloud.com/dev-static/mona-loading-default.gif" />
```

#### domain

```jsx
<img src="https://sylas-image.vhhg.site/tc%3Ac502cd01c910b4f53d860d6bd078ff.gif" />
```

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
              customPath: false,
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
        customPath: false,
        headers:{}
    })
    .end();
}
```

## 需要注意以下事项：

- 在 Taro 中使用时，需要先清除 url-loader 的默认配置（Webpack 4-5）
- 经过测试发现，在 Webpack 5 中的 CSS 文件中使用别名路径替换有异常，请查看此 [isues](https://github.com/NervJS/taro/issues/13595)
- 七牛云对象上传函数的 result 返回值无法拼接远程文件路径，需要配置 domain 默认参数。在使用时，请务必参考文档并按需进行修改。

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
- [x] 七牛云接入
- [ ] 项目升级为 ts

## 结语

`rocket-cdn` 是一款非常实用的工具，可帮助开发者将图片等资源上传至云存储，省去手动上传操作，并自动生成 CDN 可使用的地址。这提高了应用的加载速度和性能。除此之外还支持多种存储服务，并且配置简单易用。
