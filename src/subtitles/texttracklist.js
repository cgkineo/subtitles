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
