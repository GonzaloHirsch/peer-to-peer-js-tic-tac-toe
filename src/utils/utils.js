/**
 * Generates a random number between `min` and `max`.
 * @param {Integer} min limit.
 * @param {Integer} max limit.
 * @returns a random number (integer) between `min` and `max`.
 */
const getRandom = (min, max) => Math.floor(Math.random() * (max - min)) + min;

module.exports = {
  getRandom
};
