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
