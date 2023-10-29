module.exports = {
  LAUNCH: [
    'Welcome to your movie map! Ask me where to stream, rent, or buy a movie! I can also pick random movies!',
    'Welcome to your movie map!',
    'Welcome to your movie map! Let me help you find what you want to see!'
  ],
  HELP: 'You can ask me where to stream, buy, or rent any movie!',
  GOODBYE: 'Goodbye! Enjoy your movie!',
  MOVIE: {
    LOCATION: (action, movie, list) => `You can ${action} ${movie} on ${list}!`,
    RANDOM: (title) => `I found a movie for you! The movie is ${title}.`
  },
  ACTIONS: {
    BUY: 'buy',
    RENT: 'rent',
    STREAM: 'stream'
  },
  ERROR: {
    PERMISSIONS:
      'Please enable Location permissions for this skill in the Amazon Alexa app.',
    LOCATION: `It looks like you don't have an address set. You can set your address from the companion app.`,
    UNKNOWN: 'Uh Oh. Looks like something went wrong.',
    NO_UNDERSTAND:
      "Sorry, I don't understand your command. Please say it again.",
    NO_MOVIE: 'Sorry, I need a movie to search for you. Please say it again.',
    NO_RANDOM_MOVIE: `Sorry, I couldn't find a suitable movie right now. Please try again later.`,
    NOT_FOUND_MOVIE:
      'Sorry, there was an error looking for that movie. Please say it again.',
    NO_SERVICES: (title) =>
      `Sorry, I couldn't find any services for ${title}. Please try another movie.`,
    NO_STREAM: (title) =>
      `Sorry, it seems like right now you cannot stream ${title}. Maybe try another movie?.`
  }
};
