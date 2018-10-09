var toArray = function(args, start) {
  if (!args) return [];
  return Array.prototype.slice.call(args, start || 0);
};
