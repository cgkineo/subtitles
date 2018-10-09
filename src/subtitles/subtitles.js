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
