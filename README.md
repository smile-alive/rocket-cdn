# rocket-cdn

> rocket-cdn 用于处理图片资源，将图片上传 cos，返回 cdn 地址替换本地引用，支持 cos 和 oss

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

|                                      参数                                       |   类型   | 必传项 |                                                                   必传项                                                                    |
| :-----------------------------------------------------------------------------: | :------: | :----: | :-----------------------------------------------------------------------------------------------------------------------------------------: |
|                                    secretId                                     |  string  |   是   |                                                                  SecretId                                                                   |
|                                    secretKey                                    |  string  |   是   |                                                                  secretKey                                                                  |
|                                     bucket                                      |  string  |   是   |                                                                存储桶的名称                                                                 |
|                                     region                                      |  string  |   是   |                                                               存储桶所在地域                                                                |
|                                     ossType                                     | ali / tc |   是   |                                                                存储对象平台                                                                 |
|                                     domain                                      |  string  |   否   |                                                                 自定义域名                                                                  |
|                                    origPath                                     | boolean  |   否   |                                                      是否使用图片原始路径，默认 false                                                       |
|                                     headers                                     |  object  |   否   | 拓展参数， 支持 oss 上传方法所有配置（function 除外）<br />具体信息可参考官方文档[cos](https://cloud.tencent.com/document/product/436/7749) |
| [oss](https://help.aliyun.com/document_detail/31978.html?spm=a2c4g.476494.0.i0) ||||

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
            ossType: 'tc',
            domain: '',
            origPath: false,
            headers:{}
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
