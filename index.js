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