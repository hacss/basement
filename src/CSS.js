var autoprefixer = require("autoprefixer");
var postcss = require("postcss");
var scopify = require("postcss-scopify");

exports.prefix = function(css) {
  return autoprefixer.process(css).css;
};

exports.scope = function(scope) {
  var _postcss = postcss([scopify(scope)]);
  return function(css) {
    return _postcss.process(css).css;
  };
};

