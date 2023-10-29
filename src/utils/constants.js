// Exports some constants and abstracts them from the environment variables as well.
module.exports = {
  SLOTS: {
    MOVIE_NAME: 'movie_name'
  },
  API: {
    URL: process.env.BACKEND_URL,
    KEY: process.env.BACKEND_KEY
  },
  ACTIONS: {
    STREAM: 'STREAM',
    BUY: 'BUY',
    RENT: 'RENT'
  }
};
