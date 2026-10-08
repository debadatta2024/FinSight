// Makes user text safe to put inside a regular expression, so searching for
// "a.b" or "(" matches those exact characters instead of acting as regex syntax.
module.exports = function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
