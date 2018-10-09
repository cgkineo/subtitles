'use strict';(function(factory){if(typeof define==='function'&&define.amd){define(function(){return factory(window);});}else if(typeof module==='object'&&module.exports){module.exports=function(root){return factory(root);};}else{factory(window);}}(function(window){
var toArray = function(args, start) {
  if (!args) return [];
  return Array.prototype.slice.call(args, start || 0);
};

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

var removeAttribute = function(element, name) {
  if (element.removeAttribute) return element.removeAttribute(name);
  if (element.attributes.removeNamedItem && element.attributes.getNamedItem(name)) {
    return element.attributes.removeNamedItem(name);
  }
  element.setAttribute(name, "");
};

var removeElement = function(element) {
  if (element.remove) return element.remove();
  element.parentNode.removeChild(element);
};

var createEvent = function(name, options) {
  options = defaults(options, {
    bubbles: false,
    cancelable: true
  });
  if (!createEvent._ie11) {
    try {
      var event = new Event(name, options);
      return event;
    } catch (e) {
      createEvent._ie11 = true;
    }
  }
  if (!createEvent._ie11) return;
  var event = document.createEvent('Event');
  event.initEvent(name, options.bubbles, options.cancelable);
  return event;
};

var EventsInitialize = function(subject) {
  if (subject.events && subject.trigger) return;
  var extendWith = {};
  if (!subject.events) extendWith.events = new EventsRegistry();
  if (!subject.trigger) extendWith.trigger = Events.trigger;
  extendNotEnumerable(subject, extendWith);
};

var EventsArgumentsNotation = function(args, callback, that) {
  args = toArray(args);
  if (args[0] instanceof Object) {
    var subject = args[1] || this;
    for (var k in args[0]) {
      var names = k.split(" ");
      for (var i = 0, l = names.length; i < l; i++) {
        var name = names[i];
        var cb = args[0][k];
        callback.call(that, name, cb, subject);
      }
    }
  } else if (typeof args[0] === "string") {
    var subject = args[2] || this;
    var names = args[0].split(" ");
    for (var i = 0, l = names.length; i < l; i++) {
      var name = names[i];
      var cb = args[1];
      callback.call(that, name, cb, subject);
    }
  } else if (args.length === 0) {
    return callback.call(that, null, null, null);
  }
};

var EventsRegistry = function() {};
EventsRegistry.prototype = new Array();

var EventRegister = function(options) {
  if (!options.name) return;
  if (!options.callback) {
    throw "Cannot find callback";
  }
  EventsInitialize(options.from);
  EventsInitialize(options.to);
  this.from = options.from;
  this.to = options.to;
  this.context = options.context;
  this.name = options.name;
  this.callback = options.callback;
  this.once = options.once;
  this.from.events.push(this);
  if (this.from === this.to) return;
  this.to.events.push(this);
};
EventRegister.prototype.destroy = function() {
  this.from.events = this.from.events.filter(function(event) {
    return event !== this;
  }.bind(this));
  if (this.from === this.to) return;
  this.to.events = this.to.events.filter(function(event) {
    return event !== this;
  }.bind(this));
};

var Events = {

  events: null,

  listenTo: function(subject, name, callback) {
    var args = toArray(arguments, 1);
    args.push(subject);
    EventsArgumentsNotation(args, function(name, callback, subject) {
      new EventRegister({
        from: subject,
        to: this,
        context: this,
        name: name,
        callback: callback,
        once: false
      });
    }, this);
  },

  listenToOnce: function(subject, name, callback) {
    var args = toArray(arguments, 1);
    args.push(subject);
    EventsArgumentsNotation(args, function(name, callback, subject) {
      new EventRegister({
        from: subject,
        to: this,
        context: this,
        name: name,
        callback: callback,
        once: true
      });
    }, this);
  },

  stopListening: function(subject, name, callback) {
    var args = toArray(arguments, 1);
    args.push(subject);
    EventsArgumentsNotation(args, function(name, callback, subject) {
      for (var i = this.events.length - 1; i > -1; i--) {
        var event = this.events[i];
        if (event.to !== this) continue;
        if (name !== null && event.name !== name) continue;
        if (callback !== null && event.callback !== callback) continue;
        event.destroy();
      }
    }, this);
  },

  on: function(name, callback, context) {
    EventsArgumentsNotation(arguments, function(name, callback, context) {
      new EventRegister({
        from: this,
        to: this,
        context: context,
        name: name,
        callback: callback,
        once: false
      });
    }, this);
  },

  once: function(name, callback, context) {
    EventsArgumentsNotation(arguments, function(name, callback, context) {
      new EventRegister({
        from: this,
        to: this,
        context: context,
        name: name,
        callback: callback,
        once: true
      });
    }, this);
  },

  off: function(name, callback, context) {
    EventsArgumentsNotation(arguments, function(name, callback, context) {
      for (var i = this.events.length - 1; i > -1; i--) {
        var event = this.events[i];
        if (event.from !== this) continue;
        if (name !== null && event.name !== name) continue;
        if (callback !== null && event.callback !== callback) continue;
        event.destroy();
      }
    }, this);
  },

  trigger: function(name) {
    EventsInitialize(this);
    var args = toArray(arguments, 1);
    var events = [];
    for (var i = 0, l = this.events.length; i < l; i++) {
      var event = this.events[i];
      if (event.from !== this) continue;
      if (event.name !== name) continue;
      events.push(event);
    }
    events.reverse();
    for (var i = events.length - 1; i > -1; i--) {
      var event = events[i];
      event.callback.apply(event.context, args);
      if (!event.once) continue;
      event.destroy();
    }
  },

  destroy: function() {
    this.stopListening();
  }

};

/**
 * A tool for easily creating getter and setters in ES5
 * Class({
 *   funcName$value : function() {
 *     // this function is not enumerable, writable or configurable
 *   },
 *   propName$set$enum$config: function(value) {
 *     this._propName = value;
 *   },
 *   propName$get: function() {
 *     return this._propName;
 *   }
 * });
 * @param  {Object} cls Class on which to apply properties pattern
 * @return {Object}     Return cls, modified.
 */
var properties = function(cls, fromCls) {
  var isForce = !!fromCls;
  fromCls = fromCls || cls;
  var props = {};
  var names = Object.getOwnPropertyNames(fromCls);
  for (var i = 0, l = names.length; i < l; i++) {
    var name = names[i];
    var dollar = name.indexOf("$");
    if (dollar === -1 && !isForce) continue;
    var end;
    var begin;
    if (dollar === -1) {
      end = "";
      begin = name;
    } else {
      end = name.slice(dollar);
      begin = name.slice(0, dollar);
    }
    if (!begin) continue;
    var values = end.split("$");
    var isGet = includes(values, "get");
    var isSet = includes(values, "set");
    var isValue = includes(values, "value");
    var isEnum = includes(values, "enum");
    var isWriteable = includes(values, "write");
    var isConfigurable = includes(values, "config");
    var defs = 0;
    defs += isGet ? 1 : 0;
    defs += isSet ? 1 : 0;
    defs += isValue ? 1 : 0;
    if (defs > 1) throw "Cannot have two types in one definition.";
    defs += isEnum ? 1 : 0;
    defs += isWriteable ? 1 : 0;
    defs += isConfigurable ? 1 : 0;
    var prop = props[begin] = props[begin] || {
      value: fromCls[name]
    };
    if (isValue) prop.value = fromCls[name];
    if (isGet) prop.get = fromCls[name];
    if (isSet) prop.set = fromCls[name];
    if (isEnum) prop.enumerable = true;
    if (isWriteable) prop.writable = true;
    if (isConfigurable) prop.configurable = true;
    if (prop.value && (prop.get || prop.set)) delete prop.value;
    delete fromCls[name];
    delete cls[begin];
  }
  if (!Object.keys(props).length) return cls;
  Object.defineProperties(cls, props);
  return cls;
};

/**
 * A simple class implementation akin to Backbonejs.
 * var cls = Class({
 *  instanceFunction: function() {
 *    console.log("parent function");
 *  }
 * }, {
 *  classFunction: function() {
 *    console.log("class function");
 *  }
 * }, {
 *    inheritClassEnumerables: false,
 *    classEvents: false,
 *    classProperties: true,
 *    instanceEvents: false,
 *    instanceProperties: true
 * });
 * @param {Object} proto  An object describing the Class prototype properties.
 * @param {Object} parent An object describing the Class properties.
 */
var ClassExtend = function(proto, cls, options) {
  var parent = this;
  var child;

  // Create or pick constructor
  if (proto && proto.hasOwnProperty("constructor")) child = proto.constructor;
  else child = function Class() { return parent.apply(this, arguments); };

  Object.defineProperty(child, 'options', {
    value: defaults(options, parent.options, {
      extendFunction: true,
      inheritClassEnumerables: false,
      classEvents: false,
      classProperties: true,
      instanceEvents: false,
      instanceProperties: true
    }),
    enumerable: false,
    writable: true
  });

  // Generate new prototype chain
  child.prototype = Object.create(parent.prototype);

  // Add extend function
  if (child.options.extendFunction) {
    extendNotEnumerable(child, {
      extend: ClassExtend
    });
  }

  // Add events system to Class
  if (child.options.classEvents) {
    extendNotEnumerable(child, Events);
  }

  // Extend constructor with parent functions and cls properties
  if (child.options.inheritClassEnumerables) extend(child, parent);
  extend(child, cls);

  // Add events system to prototype
  if (child.options.instanceEvents) {
    extendNotEnumerable(child.prototype, Events);
  }

  // Extend constructor.prototype with prototype chain
  extend(child.prototype, proto);

  // Apply properties pattern to constructor prototype
  if (child.options.instanceProperties) {
    Object.defineProperty(child.prototype, "defineProperties", {
      value: function(props) {
        return properties(this, props);
      },
      enumerable: false,
      writable: false,
      configurable: false
    });
    properties(child.prototype);
  }

  // Apply properties pattern to constructor
  if (child.options.classProperties) {
    Object.defineProperty(child, "defineProperties", {
      value: function(props) {
        return properties(this, props);
      },
      enumerable: false,
      writable: false,
      configurable: false
    });
    properties(child);
  }

  // Reassign constructor
  extendNotEnumerable(child.prototype, {
    constructor: child
  });

  return child;
};

var ClassParent = function Class(proto, cls) {};
var ListParent = function List(proto, cls) {};
ListParent.prototype = new Array();

// Create base Class and List prototypes
// Add Events system to both class and instances
var Class = ClassExtend.call(ClassParent, {}, {}, { classEvents: false, instanceEvents: false });
var List = ClassExtend.call(ListParent, {}, {}, { classEvents: false, instanceEvents: false });

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

var Subtitles = Class.extend({

  el: null,
  target: null,
  options: null,

  constructor: function Subtitles(video, target, options) {
    bindAll(this, "onTimeUpdate", "onTextTrackChange", "onCueEnter", "onCueExit");
    this.el = video;
    this.target = target;
    this.options = options;
    this.el[Subtitles.propName] = this;
    this.setUpListeners();
    this.defineProperties({
      tracks$enum$write: new Subtitles.TextTrackList(this)
    });
  },

  dispatchEvent: function(name, options) {
    var event = createEvent(name, options);
    event.fake = true;
    extend(event, options);
    this.el.dispatchEvent(event);
  },

  setUpListeners: function() {
    elements(this.el).on({
      timeupdate: this.onTimeUpdate,
      texttrackchange: this.onTextTrackChange,
      cueenter: this.onCueEnter,
      cueexit: this.onCueExit
    });
  },

  onTimeUpdate: function() {
    for (var i = 0, l = this.tracks.length; i < l; i++) {
      var track = this.tracks[i];
      track.update();
    }
  },

  onTextTrackChange: function(event) {
    this.target.innerHTML = "";
  },

  onCueEnter: function(event) {
    this.target.appendChild(event.cue.getCueAsHTML());
  },

  onCueExit: function(event) {
    var cueElements = this.target.querySelectorAll("#"+event.cue.id);
    for (var i = 0, l = cueElements.length; i < l; i++) {
      var cueElement = cueElements[i];
      removeElement(cueElement);
    }
  },

  destroy: function() {
    delete this.el[Subtitles.propName];
    elements(this.el).off({
      timeupdate: this.onTimeUpdate,
      texttrackchange: this.onTextTrackChange,
      cueenter: this.onCueEnter,
      cueexit: this.onCueExit
    });
    this.tracks.destroy();
    this.el = null;
    this.target = null;
    this.options = null;
    this.stopListening();
  }

}, {

  supportedTags$write: "video, audio, canvas, img",
  propName: "subtitles",

  List: List.extend({}, {}, { instanceEvents: true })

}, {
  instanceEvents: true
})

Subtitles.DefaultOptions = Class.extend({

  constructor: function Options(options) {
    this.add(options);
  },

  add$value: function(options) {
    extend(this, options);
  },

  get$value: function(name) {
    if (name) {
      return this[name];
    }
    var options = {};
    for (var name in this) {
      options[name] = this[name];
    }
    return options;
  }

}, {

  add$value$enum: function(options) {
    deepDefaults(this.prototype, options);
  },

  get$value$enum: function(name) {
    if (name) {
      return this.prototype[name];
    }
    var options = {};
    for (var name in this.prototype) {
      options[name] = this.prototype[name];
    }
    return options;
  }

}, {
  inheritClassEnumerables: true
});

Subtitles.DefaultOptions.add({
  classprefix: "subtitles--"
});

if ($ && $.fn) {
  // jQuery API

  Subtitles.JQueryDefaultOptions = Subtitles.DefaultOptions.extend({
    constructor: function JQueryDefaultOptions() {
      Subtitles.DefaultOptions.prototype.constructor.apply(this, arguments);
    }
  });
  Subtitles.JQueryDefaultOptions.add({

  });

  $.fn.subtitles = function(selector, options) {

    // Get all media tags selected and make Media instances for them
    var $medias = this.find(Subtitles.supportedTags);
    $medias = $medias.add(this.filter(Subtitles.supportedTags));

    switch (selector) {
      case "destroy":
        // Tear down all media class + dom associations
        $medias.each(function(index, item) {
          if (!(item[Subtitles.propName] instanceof Subtitles)) return;
          item[Subtitles.propName].destroy();
        });
        return $medias;
    }

    var target = $(selector)[0];
    var item = $medias[0];
    if (item[Subtitles.propName]) return;
    options = new Subtitles.JQueryDefaultOptions(options);
    new Subtitles(item, target, options);
    return $medias;

  };

}

Subtitles.TextTrack = Subtitles.extend({

  activeCues: null,
  cues: null,
  readyState: 0,
  label: null,
  kind: null,
  language: null,
  el: null,
  media: null,
  mode: "hidden",

  _default: false,

  default$get: function() {
    return this._default;
  },

  default$set: function(value) {
    if (this._default === value) return;
    this._default = value;
    this.trigger("change", true);
    this.media.dispatchEvent("texttrackchange", {
      track: this
    });
    for (var i = 0, l = this.activeCues.length; i < l; i++) {
      this.activeCues[i].live = false;
    }
    this.activeCues.length = 0;
  },

  constructor: function TextTrack(media, el) {
    this.cues = [];
    this.activeCues = [];
    this.el = el;
    this.media = media;
    this.default = (this.el.getAttribute("default")!==null);
    this.language = this.el.getAttribute("srclang");;
    this.label = this.el.getAttribute("label");
    this.kind = this.el.getAttribute("kind");
    removeAttribute(this.el, "default");
    this.fetch();
  },

  addCue: function(addCue) {
    for (var i = this.cues.length-1; i > -1; i--) {
      var cue = this.cues[i];
      if (cue !== addCue && cue.id !== addCue.id) continue;
      return;
    }
    this.cues.push(addCue);
  },

  removeCue: function(removeCue) {
    for (var i = this.cues.length-1; i > -1; i--) {
      var cue = this.cues[i];
      if (cue !== removeCue && cue.id !== removeCue.id) continue;
      this.cues.splice(i, 1);
    }
  },

  update$value: function() {
    if (!this.default) return;
    var ct = this.media.el.currentTime;
    var newLiveCues = this.cues.filter(function(cue) {
      return (cue.startTime <= ct && cue.endTime >= ct && !cue.live);
    });
    var toRemove = this.activeCues.filter(function(cue) {
      return (cue.startTime > ct || cue.endTime < ct) && cue.live;
    });
    if (newLiveCues.length === 0 && toRemove.length === 0) return;
    toRemove.forEach(function(cue) {
      cue.live = false;
    });
    this.activeCues = this.activeCues.filter(function(cue) {
      return !(cue.startTime > ct || cue.endTime < ct);
    });
    this.activeCues.push.apply(this.activeCues, newLiveCues);
    newLiveCues.forEach(function(cue) {
      cue.live = true;
    });
    this.media.dispatchEvent("cuechange", {
      track: this,
      media: this
    });
  },

  fetch$value: function() {
    this.readyState = Subtitles.TextTrack.READYSTATE.LOADING;
    getUrl(this.el.src, function(data) {
      if (!data) {
        this.readyState = Subtitles.TextTrack.READY_STATE.ERROR;
        return;
      }
      if (!this.parse(data)) {
        this.readyState = Subtitles.TextTrack.READYSTATE.ERROR;
      } else {
        this.readyState = Subtitles.TextTrack.READYSTATE.LOADED;
      }
      this.trigger("load", this);
    }, this);
  },

  parse$value: function(raw) {

    var eolChars = raw.indexOf("\r\n") > -1 ? "\r\n" : "\n";
    var lines = raw.split(eolChars);

    var groups = [];
    var group = [];

    // Get groups by line breaks
    for (var i = 0, l = lines.length; i < l; i++) {
      var line = lines[i];

      var isEnd = (i === lines.length-1);
      var isBlank = !line;

      if (isEnd && !isBlank) {
        group.push(line);
      }

      // form group
      if ((isEnd || isBlank) && group.length) {

        if (group[0].toLowerCase().indexOf("webvtt") > -1) {
          // drop webvtt line
          group.splice(0, 1);
          // drop group if empty
          if (!group.length) continue;
        }

        groups.push({
          title: null,
          lines: group
        });

        group = [];
        continue;

      }

      if (isBlank) continue;

      group.push(line);

    }

    // Remove NOTES and STYLES
    try {
      for (var i = 0, l = groups.length; i < l; i++) {
        var group = groups[i];
        var isNote = (group.lines[0].indexOf("NOTE") === 0);
        if (isNote) continue;

        var isStyle = (group.lines[0].indexOf("STYLE") === 0);
        if (isStyle) {
          console.log("Media does not support STYLE lines in WebVTT yet. Please leave an issue if needed.");
          // TODO: make style parser
          // https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API#Styling_WebTT_cues
          continue;
        }

        if (group.lines[0].indexOf("-->") === -1) {
          group.title = group.lines[0];
          group.lines.shift();
        }

        if (group.lines[0].indexOf("-->") === -1) {
          this.readyState = Subtitles.TextTrack.READYSTATE.ERROR;
          break;
        } else {
          extend(group, this.parseTimePlacement(group.lines[0]));
          group.lines.shift();
        }

        var cue = new Subtitles.TextTrackCue(group.startTime, group.endTime, group.lines.join("\n"));
        cue.track = this;
        cue.lineAlign = group.align;
        cue.line = group.line;
        cue.position = group.position;
        cue.size = group.size;
        cue.vertical = group.vertical;
        this.addCue(cue);

      }
    } catch (error) {
      console.log(error);
      return false;
    }

    // TODO: make line tag parser if required
    // https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API#Cue_payload_text_tags

    return true;
  },

  parseTimePlacement$value: function(line) {

    line = line.trim();

    var breakpoint = indexOfRegex(line, /-->/);
    if (breakpoint === -1) throw "Time declaration error, no -->";
    var start = line.slice(0, breakpoint).trim();
    line = line.slice(breakpoint);

    var startpoint = indexOfRegex(line, /[0-9]+/);
    if (startpoint === -1) throw "Time declaration error, no end time";
    line = line.slice(startpoint);

    var breakpoint = indexOfRegex(line, /[ ]{1}/);
    if (breakpoint === -1) breakpoint = line.length;
    var end = line.slice(0, breakpoint).trim();
    line = line.slice(breakpoint);

    return extend({
      startTime: this.parseTime(start),
      endTime: this.parseTime(end)
    }, this.parsePlacement(line));

  },

  timeUnits$value: [1/1000, 1, 60, 360],
  parseTime$value: function(time) {

    var blocks = time.split(/[\:\.\,]{1}/g).reverse();
    if (blocks.length < 3) throw "Time declaration error, mm:ss.ttt or hh:mm:ss.tt";
    var seconds = 0;
    for (var i = 0, l = blocks.length; i < l; i++) {
      seconds += this.timeUnits[i]*parseInt(blocks[i]);
    }
    return seconds;

  },

  parsePlacement$value: function(line) {

    var items = line.split(" ").filter(function(item) {return item;});
    var parsed = {
      line: -1,
      position: "50%",
      size: "100%",
      align: "middle"
    };
    items.forEach(function(item) {
      var parts = item.split(":");
      var valueParts = parts[1].split(",");
      var name = parts[0].toLowerCase();
      switch (name) {
        case "d": name = "vertical"; break;
        case "l": name = "line"; break;
        case "t": name = "position"; break;
        case "s": name = "size"; break;
        case "a": name = "align"; break;
        case "vertical": case "line": case "position": case "size": case "align": break;
        default:
          throw "Bad position declaration, "+name;
      }
      parsed[name] = valueParts[0] || parsed[name];
    });

    // set vertical to rl/lr/horizontal
    parsed.vertical = (parsed.vertical === "vertical") ?
      "rl" :
      (parsed.vertical === "vertical-lr") ?
      "lr" :
      "horizontal";

    for (var name in parsed) {
      var value = parsed[name];
      switch (name) {
        case "line":
          value = String(value || -1);
          break;
        case "position":
          value = String(value || "0%");
          break;
        case "size":
          value = String(value || "100%");
          break;
        case "align":
          value = String(value || "middle");
          switch (value) {
            case "start": case "middle": case "end":
              break;
            default:
              throw "Invalid align declaration";
          }
          break;
      }
    }

    return parsed;
  },

  destroy: function() {
    for (var i = 0, l = this.cues.length; i < l; i++) {
      this.cues[i].destroy();
    }
    this.cues.length = 0;
    this.activeCues.length = 0;
    this.media = null;
    this.el = null;
    this.stopListening();
  }

}, {

  READYSTATE: {
    NONE: 0,
    LOADING: 1,
    LOADED: 2,
    ERROR: 3
  }

});

/**
 * A combination of TextTrackCue and VTTCue
 * @type {Object}
 */
Subtitles.TextTrackCue = Subtitles.extend({

  region: null,
  track:null,
  id: null,
  startTime: null,
  endTime: null,
  vertical: null,
  snapToLines: null,
  line: null,
  lineAlign: null,
  position: null,
  positionAlign: null,
  size: null,
  textAlign: null,
  text: null,
  _live: false,

  live$get: function() {
    return this._live;
  },

  live$set: function(value) {
    var eventName;
    if (!this._live && value) eventName = "enter";
    else if (this._live && !value) eventName = "exit";
    if (!eventName) return;
    this._live = value;
    this.trigger(eventName, this);
    this.track.media.dispatchEvent("cue"+eventName, {
      cue: this
    });
  },

  constructor: function TextTrackCue(startTime, endTime, text) {
    this.id = "cue-" + ++Subtitles.TextTrackCue.id,
    this.startTime = startTime;
    this.endTime = endTime;
    this.text = text;
  },

  getCueAsHTML: function() {
    var classprefix = this.track.media.options.classprefix;
    var containerSpan = document.createElement("span");
    var containerAttributes = {
      id: this.id,
      lang: this.track.language,
      class: classprefix+"cue",
      style: ""
    }
    this.renderCuePlacement(containerAttributes, this);
    for (var k in containerAttributes) {
      containerSpan.setAttribute(k, containerAttributes[k]);
    }
    var innerSpan = document.createElement("span");
    innerSpan.setAttribute("class", classprefix+"cue-text");
    innerSpan.innerHTML = '<span class="'+classprefix+'cue-line">' + this.text.replace(/\n/g, '</span><br><span class="'+classprefix+'cue-line">') + "</span>";
    containerSpan.appendChild(innerSpan);
    return containerSpan;
  },

  renderCuePlacement$value: function(htmlObj, cue) {

    var classprefix = this.track.media.options.classprefix;
    var classes = htmlObj['class'].split(" ");
    classes.push(classprefix+"cue-"+cue.vertical);
    var style = "position: absolute;";

    switch (cue.vertical) {
      case "horizontal":
        style += "transform: translateX(-50%);"
        switch (cue.lineAlign) {
          case "start":
            style += "text-align: left;";
            classes.push(classprefix+"cue-align-left");
            break;
          case "middle":
            style += "text-align: center;";
            classes.push(classprefix+"cue-align-center");
            break;
          case "end":
            style += "text-align: right;";
            classes.push(classprefix+"cue-align-right");
            break;
        }
        style += "width:" + cue.size +";";
        style += "left:" + cue.position +";";
        var isPercentageMeasure = (String(cue.line).indexOf("%") > -1);
        if (isPercentageMeasure || cue.line >= 0) {
          var top = cue.line;
          style += "top:" + cue.line + "%";
        } else {
          var bottom = 100 - (Math.abs(cue.line) * 100);
          style += "bottom:" + bottom + "%";
        }
        break;
      case "rl":
        style += "transform: translateY(-50%);";
        switch (cue.lineAlign) {
          case "start":
            style += "text-align: left;";
            classes.push(classprefix+"cue-align-top");
            break;
          case "middle":
            style += "text-align: center;";
            classes.push(classprefix+"cue-align-middle");
            break;
          case "end":
            style += "text-align: right;";
            classes.push(classprefix+"cue-align-bottom");
            break;
        }
        style += "height:" + cue.size +";";
        style += "top:" + cue.position +";";
        var isPercentageMeasure = (String(cue.line).indexOf("%") > -1);
        if (isPercentageMeasure || cue.line >= 0) {
          var left = cue.line;
          style += "left:" + cue.line + "%";
        } else {
          var right = 100 - (Math.abs(cue.line) * 100);
          style += "right:" + right + "%";
        }
        break;
      case "lr":
        style += "transform: translateY(-50%);";
        switch (cue.lineAlign) {
          case "start":
            style += "text-align: left;";
            classes.push(classprefix+"cue-align-top");
            break;
          case "middle":
            style += "text-align: center;";
            classes.push(classprefix+"cue-align-middle");
            break;
          case "end":
            style += "text-align: right;";
            classes.push(classprefix+"cue-align-bottom");
            break;
        }
        style += "height:" + cue.size +";";
        style += "top:" + cue.position +";";
        var isPercentageMeasure = (String(cue.line).indexOf("%") > -1);
        if (isPercentageMeasure || cue.line >= 0) {
          var right = cue.line;
          style += "right:" + cue.line + "%";
        } else {
          var left = 100 - (Math.abs(cue.line) * 100);
          style += "left:" + left + "%";
        }
        break;
    }

    htmlObj['class'] = classes.join(" ");
    htmlObj['style'] = style;

    return htmlObj;

  },

  destroy: function() {
    this.media = null;
  }

}, {
  id: 0
});

/**
 * TextTrackList keeps all of the VTT tracks from the media component for use
 * in rendering captions or subtitles.
 * TODO: update track list when dom changes
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
Subtitles.TextTrackList = Subtitles.List.extend({

  media: null,

  constructor: function TextTrackList(media) {
    this.media = media;
    this.fetch();
  },

  fetch$value: function() {
    this.destroy();
    var loaded = 0;
    var counted = 0;
    function onLoaded(lang) {
      if (lang.readyState === Subtitles.TextTrack.READYSTATE.ERROR) {
        counted--;
        delete tracks[lang.lang];
      } else {
        loaded++;
      }
      if (loaded !== counted) return;
      this.addTracks(ObjectValues(tracks));
    }
    var tracks = {};
    var trackElements = this.media.el.querySelectorAll("track[type='text/vtt']");
    toArray(trackElements).forEach(function(el) {
      var lang = el.getAttribute("srclang");
      var src = el.getAttribute("src");
      if (!lang || !src || tracks[lang]) return;
      counted++;
      tracks[lang] = new Subtitles.TextTrack(this.media, el);
      tracks[lang].once("load", onLoaded.bind(this));
    }, this);
  },

  addTracks$value: function(tracks) {
    for (var i = 0, l = tracks.length; i < l; i++) {
      this.addTrack(tracks[i]);
    }
  },

  addTrack: function(track) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === track) return;
    }
    this.push(track);
    this.trigger("add", track, this);
    this.media.dispatchEvent("addtexttrack", {
      track: track
    });
  },

  removeTrack: function(track) {
    var isRemoved = false;
    for (var i = this.length-1; i > -1; i--) {
      if (this[i] !== track) continue;
      this.splice(i, 1);
      isRemoved = true;
    }
    if (!isRemoved) return;
    this.trigger("remove", track, this);
    this.media.dispatchEvent("removetexttrack", {
      track: track
    });
  },

  getTrackById: function(id) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i].el.id === id) return this[i];
    }
    return null;
  },

  destroy: function() {
    for (var i = 0, l = this.length; i < l; i++) {
      this[i].destroy();
    }
    this.length = 0;
    this.stopListening();
  }

});

Subtitles.defineProperties({
  "utils$write": {}
});
Subtitles.utils.Class = Class;
Subtitles.utils.List = List;
Subtitles.utils.Elements = Elements;
Subtitles.utils.elements = elements;
Subtitles.utils.Events = Events;
Subtitles.utils.EventsInitialize = EventsInitialize;
Subtitles.utils.EventsArgumentsNotation = EventsArgumentsNotation;
Subtitles.utils.EventRegister = EventRegister;
Subtitles.utils.EventsRegistry = EventsRegistry;
Subtitles.utils.properties = properties;
Subtitles.utils.toArray = toArray;
Subtitles.utils.extend = extend;
Subtitles.utils.extendNotEnumerable = extendNotEnumerable;
Subtitles.utils.deepDefaults = deepDefaults;
Subtitles.utils.defaults = defaults;
Subtitles.utils.indexOfRegex = indexOfRegex;
Subtitles.utils.includes = includes;
Subtitles.utils.bindAll = bindAll;
Subtitles.utils.removeAttribute = removeAttribute;
Subtitles.utils.removeElement = removeElement;
Subtitles.utils.createEvent = createEvent;

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
}));
