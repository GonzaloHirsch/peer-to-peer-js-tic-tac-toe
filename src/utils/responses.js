const constants = require('./constants');
const locale = require('../locales/en-GB');

/**
 * Combines items from a list to make a readable list of things that Alexa will read out loud.
 * @param {Array[any]} list of things to combine.
 * @returns a combined list of things with correct punctuation.
 */
const prepareList = (list) => {
  let s = '';
  for (let i = 0; i < list.length; i++) {
    if (i < list.length - 2) s += `${list[i]}, `;
    else if (i < list.length - 1) s += `${list[i]}`;
    else {
      // eslint-disable-next-line prettier/prettier
      const hasComma = list.length > 2 ? ', ' : ' ';
      s += `${list.length > 1 ? `${hasComma}and ` : ''}${list[i]}`;
    }
  }
  return s;
};

/**
 * Prepares a list of movie streaming locations given the user action and the result for the movies.
 * @param {constants.ACTIONS} action that the user invoked (buy, rent, stream, etc).
 * @param {string} movie that the user requested.
 * @param {Array[String]} list of platforms to prepare.
 * @returns a prepared string for Alexa to read out loud. The format is `You can {ACTION} {MOVIE} on {LIST}`.
 */
const prepareMovieList = (action, movie, list) => {
  let method;
  switch (action) {
    case constants.ACTIONS.BUY: {
      method = locale.ACTIONS.BUY;
      break;
    }
    case constants.ACTIONS.RENT: {
      method = locale.ACTIONS.RENT;
      break;
    }
    case constants.ACTIONS.STREAM:
    default:
      method = locale.ACTIONS.STREAM;
      break;
  }
  return locale.MOVIE.LOCATION(method, movie, prepareList(list));
};

module.exports = {
  prepareMovieList
};
