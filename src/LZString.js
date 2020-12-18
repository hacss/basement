var LZString = require("lz-string");

exports.compressToEncodedURIComponent = LZString.compressToEncodedURIComponent;
exports.decompressFromEncodedURIComponentImpl = function (l) {
  return function(r) {
    return function (x) {
      var y = LZString.decompressFromEncodedURIComponent(x);
      if (y === null || y === undefined) {
        return l("Could not decompress URL-encoded string.");
      }
      return r(y);
    };
  };
};
