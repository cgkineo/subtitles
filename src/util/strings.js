var indexOfRegex = function(value, regex, fromIndex){
  fromIndex = fromIndex || 0;
  var str = fromIndex ? value.substring(fromIndex) : value;
  var match = str.match(regex);
  return match ? str.indexOf(match[0]) + fromIndex : -1;
};

var includes = function(value, search, start) {
  if (typeof start !== 'number') start = 0;
  if (typeof value === "string" && start + search.length > value.length) return false;
  return value.indexOf(search, start) !== -1;
};
