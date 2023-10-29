const util = require('util');
const locale = require('../locales/en-GB');

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error handled: ${error.message}`);
    // Inspect the request to be able to debug for errors.
    console.error(
      util.inspect(handlerInput.requestEnvelope, true, null, false)
    );

    return handlerInput.responseBuilder
      .speak(locale.ERROR.NO_UNDERSTAND)
      .reprompt(locale.ERROR.NO_UNDERSTAND)
      .getResponse();
  }
};

module.exports = ErrorHandler;
