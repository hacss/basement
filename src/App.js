exports.hashCode = function(x) {
  var hash = 0, i, chr;
  for (i = 0; i < x.length; i++) {
    chr = x.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};
