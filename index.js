const loaderUtils = require('loader-utils')

/**
 * @param {string} content 文件的文本内容
 */
module.exports = function (content) {
  // 启用缓存
  if (this.cacheable) {
    this.cacheable()
  }
  // 获取打印 用户项目中的配置对象 use.options
  const options = loaderUtils.getOptions(this) || {}
  console.log('🚀 → loader-options: ', options)

  const useStrictPrefix = "\'use strict\';\n\n";
  return useStrictPrefix + content;
}