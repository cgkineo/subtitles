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
