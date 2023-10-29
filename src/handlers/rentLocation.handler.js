const Alexa = require('ask-sdk-core');
const movieHandler = require('./generalMovieLocation.handler');
const { ACTIONS } = require('../utils/constants');

const AskRentLocationIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'RentMovieIntent'
    );
  },
  async handle(handlerInput) {
    // Use the general movie handler with RENT action
    return await movieHandler(handlerInput, ACTIONS.RENT);
  }
};

module.exports = AskRentLocationIntentHandler;
