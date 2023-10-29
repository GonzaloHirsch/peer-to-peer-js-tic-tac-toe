const Alexa = require('ask-sdk-core');
const util = require('util');
const locale = require('../locales/en-GB');
const { getMovie } = require('../utils/client');

const AskRandomMovieIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomMovieIntent'
    );
  },
  async handle(handlerInput) {
    // Log the request for debugging purposes
    console.debug(
      util.inspect(handlerInput.requestEnvelope, true, null, false)
    );
    const sessionAttributes =
      handlerInput.attributesManager.getSessionAttributes();

    // Generate a random movie
    let foundMovie = false,
      currentTry = 0,
      randomMovieId = 0,
      movieResponse = null;

    // Iterate until we find a movie
    // No need for something like exponential backoff because errors shouldn't come from this.
    while (!foundMovie && currentTry <= 5) {
      // Generate a random ID
      randomMovieId = Math.floor(Math.random() * 1100000) + 1;
      // Look for that movie
      movieResponse = await getMovie(randomMovieId);
      console.debug(
        `Try ${currentTry} for movie ${randomMovieId}. Got ${util.inspect(
          movieResponse,
          true,
          null,
          false
        )}`
      );
      // Found a movie if success state and not an adult movie
      if (movieResponse && !movieResponse.adult) foundMovie = true;
      currentTry += 1;
    }

    // Check if it found a movie
    if (!foundMovie) {
      console.error(`Didn't find a random movie, tried ${currentTry} times.`);
      return handlerInput.responseBuilder
        .speak(locale.ERROR.NO_RANDOM_MOVIE)
        .reprompt(locale.ERROR.NO_RANDOM_MOVIE)
        .withShouldEndSession(!sessionAttributes.keepSessionOpen)
        .getResponse();
    }

    // Prepare the responses
    // eslint-disable-next-line prettier/prettier
    const speechText = `${locale.MOVIE.RANDOM(movieResponse.title)} ${movieResponse.overview}`;
    const cardText = locale.MOVIE.RANDOM(movieResponse.title);

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(cardText, speechText)
      .withShouldEndSession(!sessionAttributes.keepSessionOpen)
      .getResponse();
  }
};

module.exports = AskRandomMovieIntentHandler;
