# rocket-cdn

> rocket-cdn 用于处理图片资源，将图片上传 cos，返回 cdn 地址替换本地引用

> 目前只支持 cos，后续会拓展 oss 和七牛云等对象存储

> > taro webpack5 打包后 css 的背景图别名引用路径替换异常，相对引用正常使用

> > CRA 项目正常使用

```js
// 打包前
import src from '@/static/image/放大镜.png';
<Image mode='aspectFit' src={src} />

// 打包后
<Image mode='aspectFit' src=‘https://sylas-image.vhhg.site/825c5a02f69c8022d24e8f3b07e95323.png’ />
```

### options 参数

|     参数     |  类型   | 必传项 |                  必传项                  |
| :----------: | :-----: | :----: | :--------------------------------------: |
|   secretId   | string  |   是   |             cos 的 SecretId              |
|  secretKey   | string  |   是   |             cos 的 secretKey             |
|    bucket    | string  |   是   |               存储桶的名称               |
|    region    | string  |   是   |              存储桶所在地域              |
|    domain    | string  |   否   |                自定义域名                |
|  cacheFile   | string  |   否   |              缓存文件的路径              |
| relativePath | boolean |   否   | 是否使用文件 md5 作为图片名称，默认 true |

### webpack-chain 中使用

```js
webpackChain(chain) {
    // 因taro限制，必须移除之前添加到 image 规则中的所有插件或加载器
    chain.module.rules.delete('image');
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
            domain: '',
            relativePath: false
        })
        .end();
}
```

### webpack 中使用

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
              domain: "",
              relativePath: false,
            },
          },
        ],
      },
    ],
  },
};
```
