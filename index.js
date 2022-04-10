module.exports = function (ctx) {
  const useStrictPrefix = "\'use strict\';\n\n";
  return useStrictPrefix + ctx;
}