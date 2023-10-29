const Alexa = require('ask-sdk-core');
const {
  AskStreamLocationIntentHandler,
  AskRentLocationIntentHandler,
  AskBuyLocationIntentHandler,
  AskRandomMovieIntentHandler,
  LaunchRequestHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler,
  ErrorHandler
} = require('./handlers');

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    AskStreamLocationIntentHandler,
    AskRentLocationIntentHandler,
    AskBuyLocationIntentHandler,
    AskRandomMovieIntentHandler,
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
