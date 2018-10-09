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
