const Alexa = require('ask-sdk-core');
const util = require('util');
const constants = require('../utils/constants');
const locale = require('../locales/en-GB');
const { searchMovie, getMovieLocation } = require('../utils/client');
const { getCountryCode } = require('../utils/alexa');
const { prepareMovieList } = require('../utils/responses');

const movieHandler = async (
  handlerInput,
  action = constants.ACTIONS.STREAM
) => {
  console.debug(
    action,
    util.inspect(handlerInput.requestEnvelope, true, null, false)
  );
  const sessionAttributes =
    handlerInput.attributesManager.getSessionAttributes();

  // Get the target movie and make sure we actually have a movie
  const targetMovie = Alexa.getSlotValue(
    handlerInput.requestEnvelope,
    constants.SLOTS.MOVIE_NAME
  );
  if (!targetMovie)
    return handlerInput.responseBuilder
      .speak(locale.ERROR.NO_MOVIE)
      .reprompt(locale.ERROR.NO_MOVIE)
      .withShouldEndSession(!sessionAttributes.keepSessionOpen)
      .getResponse();

  // Request it from the API
  const movieResponse = await searchMovie(targetMovie);
  // If not success, just return the error
  if (movieResponse.status !== 200 || movieResponse.data.total_results <= 0) {
    console.error(`Error response: ${movieResponse}`);
    return handlerInput.responseBuilder
      .speak(locale.ERROR.NOT_FOUND_MOVIE)
      .reprompt(locale.ERROR.NOT_FOUND_MOVIE)
      .withShouldEndSession(!sessionAttributes.keepSessionOpen)
      .getResponse();
  }
  console.log(util.inspect(movieResponse.data, true, null, false));

  // Get the first movie result
  const apiMovie = movieResponse.data.results[0];

  // Try to get the country code
  const countryCodeResponse = await getCountryCode(handlerInput);
  if (!countryCodeResponse.success) return countryCodeResponse.payload;

  // Get the stream providers
  const streamResponse = await getMovieLocation(
    apiMovie.id,
    countryCodeResponse.payload,
    action
  );
  console.log(util.inspect(streamResponse, true, null, false));
  if (!streamResponse) {
    return handlerInput.responseBuilder
      .speak(locale.ERROR.NO_SERVICES(apiMovie.title))
      .reprompt(locale.ERROR.NO_SERVICES(apiMovie.title))
      .withShouldEndSession(!sessionAttributes.keepSessionOpen)
      .getResponse();
  } else if (streamResponse.length <= 0) {
    return handlerInput.responseBuilder
      .speak(locale.ERROR.NO_STREAM(apiMovie.title))
      .reprompt(locale.ERROR.NO_STREAM(apiMovie.title))
      .withShouldEndSession(!sessionAttributes.keepSessionOpen)
      .getResponse();
  }

  // Prepare the responses
  const speechText = prepareMovieList(
    action,
    apiMovie.title,
    streamResponse.map((obj) => obj.provider_name)
  );
  const cardText = speechText;

  return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(speechText)
    .withSimpleCard(cardText, speechText)
    .withShouldEndSession(!sessionAttributes.keepSessionOpen)
    .getResponse();
};

module.exports = movieHandler;
