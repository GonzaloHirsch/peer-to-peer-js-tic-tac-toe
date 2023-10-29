const Alexa = require('ask-sdk-core');
const movieHandler = require('./generalMovieLocation.handler');
const { ACTIONS } = require('../utils/constants');

const AskBuyLocationIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'BuyMovieIntent'
    );
  },
  async handle(handlerInput) {
    // Use the general movie handler with BUY action
    return await movieHandler(handlerInput, ACTIONS.BUY);
  }
};

module.exports = AskBuyLocationIntentHandler;
