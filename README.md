# 自定义loader

**目标:** 实现一个loader, 它会为所有JS文件启用严格模式, 也就是说他会在文件头部加上如下代码

```js
'use strict'
```



## 项目引入

1. 在开发一个loader时, 可以借助 npm/yarn 的软链接功能进行本地调试(当然后续可以考虑发布到npm)。

2. 在自己的 webpack 工程中, 通过以下命令本地安装loader

   ```bash
   npm i <path-to-loader>/force-strict-loader
   ```

   此时, 会在**项目的 node_modules 中创建一个指向实际 force-strict-loader 目录的软链接**, 也就是说之后我们可以随时修改loader源码并且不需要重复安装了

## 启用缓存

当文件输入和其依赖没有发生变化时, 应该让loader直接使用缓存。在 webpack中可以使用 `this.cacheable` 进行控制, 修改我们的loader

```js
module.exports = function (ctx) {
  // 启用缓存
  if (this.cacheable) {
    this.cacheable()
  }
  const useStrictPrefix = "\'use strict\';\n\n";
  return useStrictPrefix + ctx;
}
```

## 获取options

在 loader 中获取用户配置的 use.options。

- 需要用到的库:  **loader-utils** 它主要提供了一些帮助函数。(3.0版本以上已移除, 安装2版本的)

```bash
npm i loader-utils@2.0.2
```

- 接着修改loader:

```js
const loaderUtils = require('loader-utils')

/**
 * @param {string} content 文件的文本内容
*/
module.exports = function (content) {
  // 启用缓存
  if (this.cacheable) {
    this.cacheable()
  }
  // 获取打印 用户项目中的配置对象 options
  const options = loaderUtils.getOptions(this) || {}
  console.log('🚀 → loader-options: ', options)

  const useStrictPrefix = "\'use strict\';\n\n";
  return useStrictPrefix + content;
}
```

## source-map

**source-map** 可以便于实际开发者在浏览器控制台查看源码, 如果没有对 source-map 进行处理, 最终也就无法生成正确的map文件(映射文件), 在浏览器的 dev tool 中可能就看到错乱的源码。

- 需要用到的库: **source-map**

```bash
npm i source-map
```

- 支持了source-map后的版本

```js
const loaderUtils = require('loader-utils')
const SourceNode = require('source-map').SourceNode
const SourceMapConsumer = require('source-map').SourceMapConsumer

/**
 * @param {string} content 文件的文本内容
 * @param {object} sourceMap 由webpack或上一个loader传递下来的, 只有当其存在时, loader才能继续处理和向下传递
 */
module.exports = function (content, sourceMap) {
  const useStrictPrefix = "\'use strict\';\n\n";
  // 启用缓存
  if (this.cacheable) {
    this.cacheable()
  }

  // 获取用户项目中的配置对象 use.options
  const options = loaderUtils.getOptions(this) || {}

  // 支持 source map
  if (options.sourceMap && sourceMap) {
    const currentRequest = loaderUtils.getCurrentRequest(this)
    const node = SourceNode.fromStringWithSourceMap(
      content,
      new SourceMapConsumer(sourceMap)
    )
    node.prepend(useStrictPrefix)
    const res = node.toStringWithSourceMap({ file: currentRequest })
    const callback = this.async()
    callback(null, res.code, res.map.toJSON())
  }

  // 不支持 source map
  return useStrictPrefix + content;
}
```

- 浅析:
  1. sourceMap 由webpack或上一个loader传递下来的, 只有当其存在时, loader才能继续处理和向下传递。
  2. 通过 **source-map** 库来对 map 进行操作， 包括接受和消费之前的文件内容和 source-map，对内容节点进行修改， 最后产生新的 source-map
  3. 在函数返回的时候要使用 **this.async** 获取**callback函数** （主要是为了一次性返回多个值）。 **callback** 函数的3个参数分别是：抛出的错误、处理后的源码、source-map。
  4. 更多API请查阅Webpack官方文档 https://www.webpackjs.com/contribute/writing-a-loader/