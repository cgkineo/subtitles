var bindAll = function(subject, names) {
  if (!(names instanceof Array)) {
    names = toArray(arguments, 1);
  }
  var enumerableNames = {};
  for (var k in subject) enumerableNames[k] = true;
  for (var i = 0, l = names.length; i < l; i++) {
    var name = names[i];
    var desc = Object.getOwnPropertyDescriptor(subject, name);
    if (desc && !desc.writable) continue;
    if (!(subject[name] instanceof Function)) {
      var error = "Cannot bindAll to non-function '"+name+"'";
      console.log(error, subject);
      throw error;
    }
    var isEnumerable = enumerableNames[name];
    Object.defineProperty(subject, name, {
      value: subject[name].bind(subject),
      enumerable: isEnumerable,
      writable: true,
      configurable: true
    });
  }
};

var getUrl = function(url, callback, context) {
  var req = new XMLHttpRequest();
  req.addEventListener("load", function(event) {
    callback.call(context, event.target.responseText);
  });
  req.open("GET", url);
  req.send();
};
