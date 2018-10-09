var isObject = function(obj) {
  return Object.prototype.toString.call(obj) == '[object Object]';
};

var ObjectValues = function(obj) {
  var values = [];
  for (var k in obj) {
    values.push(obj[k]);
  }
  return values;
};

var extendNotEnumerable = function(subject, fromItemsArgs) {
  for (var i = 1, l = arguments.length; i < l; i++) {
    var arg = arguments[i];
    if (!arg) continue;
    var names = Object.keys(arg);
    for (var i = 0, l = names.length; i < l; i++) {
      var k = names[i];
      var desc = Object.getOwnPropertyDescriptor(arg, k);
      if (!desc.configurable) continue;
      Object.defineProperty(subject, k, {
        configurable: true,
        value: arg[k],
        enumerable: false,
        writable: true
      });
    }
  }
  return subject;
};

var extend = function(subject, fromItemsArgs) {
  for (var i = 1, l = arguments.length; i < l; i++) {
    var arg = arguments[i];
    for (var k in arg) {
      try {
        subject[k] = arg[k];
      } catch(err) {}
    }
  }
  return subject;
};

var deepDefaults = function(subject, fromItemsArgs) {
  subject = subject || {};
  for (var i = 1, l = arguments.length; i < l; i++) {
    var arg = arguments[i];
    for (var k in arg) {
      if (!subject.hasOwnProperty(k)) subject[k] = arg[k];
      if (!isObject(subject[k])) continue;
      subject[k] = deepDefaults(subject[k], arg[k]);
    }
  }
  return subject;
};

var defaults = function(subject, fromItemsArgs) {
  subject = subject || {};
  for (var i = 1, l = arguments.length; i < l; i++) {
    var arg = arguments[i];
    for (var k in arg) {
      if (!subject.hasOwnProperty(k)) subject[k] = arg[k];
    }
  }
  return subject;
};
