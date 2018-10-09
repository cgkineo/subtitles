var Elements = List.extend({

  subject: null,


  constructor: function Elements(selector, subject) {
    this.subject = subject || document;
    this.add(selector, this.subject);
    this.selector = selector;
  },

  filterByAttribute: function(attrName, filterValue) {
    var items = this.filter(function(item) {
      var attrValue = item.getAttribute(attrName);
      if (!attrValue) return;
      var attrValues = attrValue.split(" ");
      if (includes(attrValues, filterValue)) return true;
    });
    return new Elements(items);
  },

  filterByTypes: function(type) {
    var types = type.split(",").map(function(type) { return type.trim(); });
    var items = this.filter(function(item) {
      var typeValue = item.tagName.toLowerCase();
      if (includes(types, typeValue)) return true;
    });
    return new Elements(items);
  },

  find: function(selector) {
    var result = new Elements();
    this.forEach(function(item) {
      result.push.apply(result, Elements.querySelectorAll(item, selector));
    });
    return result;
  },

  stack: function(selector) {
    var stack = this.parents();
    stack.unshift(this[0]);
    if (selector) {
      stack = stack.filter(function(item) {
        return (item.matches(selector));
      });
    }
    return stack;
  },

  parents: function(selector) {
    var parent = this[0];
    var parents = new Elements();
    do {
      parent = parent.parentNode;
      if (parent) parents.add(parent);
    } while (parent)
    if (selector) {
      parents = parents.filter(function(item) {
        return (item.matches(selector));
      });
    }
    return parents;
  },

  add: function(selector, subject) {
    this.selector = "";
    subject = subject || document;
    if (selector instanceof HTMLElement) {
      this.push(selector);
      return this;
    }
    if (selector instanceof Array) {
      for (var i = 0, l = selector.length; i < l; i++) {
        this.add(selector[i]);
      }
      return this;
    }
    if (typeof selector === "string") {
      var elements = Elements.querySelectorAll(subject, selector);
      for (var i = 0, l = elements.length; i < l; i++) {
        this.push(elements[i]);
      }
      return this;
    }
    return this;
  },

  clone: function(deep) {
    var clones = [];
    for (var i = 0, l = this.length; i < l; i++) {
      clones.push(this[i].cloneNode(deep));
    }
    return new Elements(clones, this.subject);
  },

  on: function(name, callback, options) {
    if (name instanceof Object) {
      for (var k in name) {
        this.on(k, name[k], callback);
      }
      return this;
    }
    this.forEach(function(element) {
      element.addEventListener(name, callback, options);
    });
    return this;
  },

  off: function(name, callback) {
    if (name instanceof Object) {
      for (var k in name) {
        this.off(k, name[k]);
      }
      return this;
    }
    this.forEach(function(element) {
      element.removeEventListener(name, callback);
    });
    return this;
  }

}, {

  fallback: false,

  combinatorWithOptionalWhiteSpace$value: /^( *([+~> ,]|\|\|){1} *)/,
  types$value: /(\[[^\]]+\])*((\.|\:|\#|\w|\*|\[){1}[^\[ >~|+,]*(\[[^\]]+\])*[^\[ >~|+,]*)/,

  querySelectorAll$value: function(subject, selector) {
    if (!Elements.fallback) return subject.querySelectorAll(selector);
    // This browser doesn't support the :scope selector
    // Below is a partial parser.
    var parts = [];
    var sel = selector.trim();
    var mode = "type";
    do {
      var typeResult = Elements.types.exec(sel);
      var combinatorResult = Elements.combinatorWithOptionalWhiteSpace.exec(sel);
      if (!typeResult && !combinatorResult) {
        break;
      }
      var isCombinator = !typeResult || combinatorResult && combinatorResult.index < typeResult.index;
      if (isCombinator) mode = "combinator";
      else mode = "type";
      switch (mode) {
        case "combinator":
          var value = combinatorResult[0];
          parts.push(value);
          sel = sel.slice(value.length);
          break;
        case "type":
          var value = typeResult[0];
          parts.push(value);
          sel = sel.slice(value.length);
          break;
      }
    } while (sel.length)
    if (Elements.combinatorWithOptionalWhiteSpace.test(parts[0])) {
      parts.unshift(":scope");
    }
    if (parts[0] === ":scope") {
      switch (parts[1].trim()) {
        case ">":
          if (parts.length <= 2) {
            throw "Invalid selector";
          }
          var children = subject.children;
          var result = [];
          for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];
            if (!child.matches(parts[2])) continue;
            if (parts.length === 3) {
              result.push(child);
              continue;
            }
            var subSelector = parts.slice(3).join(" ");
            var subElements = Elements.querySelectorAll(child, subSelector);
            result.push.apply(result, subElements);
          }
          return result;
        default:
          throw "Invalid starting combinator for scope '"+parts[1]+"'";
      }
    }
    return subject.querySelectorAll(selector);
  },

});

try {
  var div = document.createElement("div");
  div.querySelector(":scope > *");
  Elements.fallback = false;
} catch(e) {
  console.log("No support for ':scope' selector. Using fallback.");
  Elements.fallback = true;
}

var elements = function(selector, subject) { return new Elements(selector, subject); };
extend(elements, Elements);
