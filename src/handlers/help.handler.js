const Alexa = require('ask-sdk-core');
const locale = require('../locales/en-GB');

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const speechText = locale.HELP;
    const cardText = speechText;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(cardText, speechText)
      .getResponse();
  }
};

module.exports = HelpIntentHandler;
