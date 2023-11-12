/**
 * Clears an HTML element of all it's children
 * @param {HTMLElement} elem to target
 */
const clearChildren = (elem) => {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
};
