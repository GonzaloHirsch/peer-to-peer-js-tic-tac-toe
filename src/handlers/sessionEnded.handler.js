const Alexa = require('ask-sdk-core');

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      'SessionEndedRequest'
    );
  },
  // Any clean-up logic goes here.
  handle(handlerInput) {
    // Make sure to flag to close the session.
    const sessionAttributes =
      handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.keepSessionOpen = false;
    return handlerInput.responseBuilder.getResponse();
  }
};

module.exports = SessionEndedRequestHandler;
