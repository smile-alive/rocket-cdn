# rocket-cdn

> rocket-cdn 用于处理图片资源，将图片上传 cos，返回 cdn 地址替换本地引用
> 目前只支持 cos,后续会拓展 oss 和七牛云等对象存储

### options 参数

|   参数    |  类型  | 必传项 |      必传项      |
| :-------: | :----: | :----: | :--------------: |
| secretId  | string |   是   | cos 的 SecretId  |
| secretKey | string |   是   | cos 的 secretKey |
|  bucket   | string |   是   |   存储桶的名称   |
|  region   | string |   是   |  存储桶所在地域  |
|  domain   | string |   否   |    自定义域名    |
| cacheFile | string |   否   |  缓存文件的路径  |

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
            domain: ''
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
            },
          },
        ],
      },
    ],
  },
};
```
