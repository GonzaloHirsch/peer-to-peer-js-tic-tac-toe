const Alexa = require('ask-sdk-core');
const movieHandler = require('./generalMovieLocation.handler');
const { ACTIONS } = require('../utils/constants');

const AskStreamLocationIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'StreamMovieIntent'
    );
  },
  async handle(handlerInput) {
    // Use the general movie handler with STREAM action
    return await movieHandler(handlerInput, ACTIONS.STREAM);
  }
};

module.exports = AskStreamLocationIntentHandler;
