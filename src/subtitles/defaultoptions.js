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
