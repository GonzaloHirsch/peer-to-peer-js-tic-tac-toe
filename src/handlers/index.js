const CancelAndStopIntentHandler = require('./cancelAndStop.handler');
const ErrorHandler = require('./error.handler');
const HelpIntentHandler = require('./help.handler');
const LaunchRequestHandler = require('./launch.handler');
const SessionEndedRequestHandler = require('./sessionEnded.handler');
const AskStreamLocationIntentHandler = require('./streamLocation.handler');
const AskBuyLocationIntentHandler = require('./buyLocation.handler');
const AskRentLocationIntentHandler = require('./rentLocation.handler');
const AskRandomMovieIntentHandler = require('./getRandomMovie.handler');

module.exports = {
  CancelAndStopIntentHandler,
  ErrorHandler,
  HelpIntentHandler,
  LaunchRequestHandler,
  SessionEndedRequestHandler,
  AskStreamLocationIntentHandler,
  AskBuyLocationIntentHandler,
  AskRentLocationIntentHandler,
  AskRandomMovieIntentHandler
};
