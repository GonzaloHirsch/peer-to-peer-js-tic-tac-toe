const Alexa = require('ask-sdk-core');
const locale = require('../locales/en-GB');

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    const envelope = handlerInput.requestEnvelope;
    return (
      Alexa.getRequestType(envelope) === 'IntentRequest' &&
      (Alexa.getIntentName(envelope) === 'AMAZON.CancelIntent' ||
        Alexa.getIntentName(envelope) === 'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    const speechText = locale.GOODBYE;
    const cardText = speechText;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(cardText, speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
};

module.exports = CancelAndStopIntentHandler;
