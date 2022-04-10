module.exports = function (ctx) {
  // 启用缓存
  if (this.cacheable) {
    this.cacheable()
  }
  const useStrictPrefix = "\'use strict\';\n\n";
  return useStrictPrefix + ctx;
}