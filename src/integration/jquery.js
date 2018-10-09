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
