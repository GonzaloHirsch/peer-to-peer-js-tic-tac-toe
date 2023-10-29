const axios = require('axios');
const constants = require('./constants');

// Variable for lazy initialization.
let client;

/**
 * Performs a lazy initialization of the client. If the client is already created, just use it.
 */
const createClient = () => {
  if (!client) {
    client = axios.create({
      baseURL: constants.API.URL,
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${constants.API.KEY}`
      }
    });
  }
};

/**
 * Search for a movie using the name.
 * @param {string} name of the movie to search for.
 * @returns a response based on the response given by the TMDB API (https://developer.themoviedb.org/reference/search-movie)
 */
const searchMovie = async (name) => {
  createClient();
  return await client.get('search/movie', {
    params: {
      query: name,
      adult: false
    }
  });
};

/**
 * Get a movie using the movie ID.
 * @param {integer} id of the movie to get.
 * @returns a movie as per TMDB API (https://developer.themoviedb.org/reference/movie-details) or undefined if not found.
 */
const getMovie = async (id) => {
  createClient();
  return await client
    .get(`movie/${id}`)
    .then((response) => {
      console.debug(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(`Handled error: ${error.message}`);
      return undefined;
    });
};

/**
 * Gets the streaming services for a given movie, for the specific action (stream, buy, rent) given the country code as a filter.
 * @param {integer} movieId for the movie to find providers.
 * @param {string} country country code ot filter results in.
 * @param {string} action from the constants.ACTIONS set of values.
 * @returns the list of providers or empty. Can be undefined if the country is not valid.
 */
const getMovieLocation = async (movieId, country, action) => {
  createClient();
  return await client
    .get(`movie/${movieId}/watch/providers`)
    .then((response) => {
      console.debug(response.data);
      // Depending on the action, we look for different parts of the response.
      switch (action) {
        case constants.ACTIONS.BUY:
          return response.data?.results?.[country]?.buy;
        case constants.ACTIONS.RENT:
          return response.data?.results?.[country]?.rent;
        case constants.ACTIONS.STREAM:
        default:
          return [].concat(
            response.data?.results?.[country]?.flatrate || [],
            response.data?.results?.[country]?.free || [],
            response.data?.results?.[country]?.ads || []
          );
      }
    })
    .catch((error) => {
      console.error(error.toJSON());
      // Return empty list of places
      return [];
    });
};

module.exports = {
  searchMovie,
  getMovie,
  getMovieLocation
};
