const locale = require('../locales/en-GB');

/**
 * Wraps building a response that other functions in this file might use.
 * @param {boolean} success if the operation was successful.
 * @param {any} payload to be returned to the called, can be anything.
 * @returns a general response to offer to the caller of this function.
 */
const buildResponse = (success, payload) => {
  return {
    success: success,
    payload: payload
  };
};

/**
 * Obtains a country code from the user's device location. If the user doesn't have a location or consent for it, it returns a speaking prompt asking to complete that. If successful, the payload is the country code.
 * @param {*} handlerInput coming from the Alexa invocation directly.
 * @returns a response based on the `buildResponse` function. It contains `success` and `payload` properties to indicate if the operation was successful or not, and the result of it, respectively.
 */
const getCountryCode = async (handlerInput) => {
  // Split variables
  const { requestEnvelope, serviceClientFactory, responseBuilder } =
    handlerInput;
  // Get the consent token for the location
  const consentToken =
    requestEnvelope.context.System.user.permissions &&
    requestEnvelope.context.System.user.permissions.consentToken;
  if (!consentToken) {
    return buildResponse(
      false,
      responseBuilder
        .speak(locale.ERROR.PERMISSIONS)
        .reprompt(locale.ERROR.PERMISSIONS)
        .withShouldEndSession(true)
        // This is commented out because for some reason is not working, although this is as per AWS's docs
        // .withAskForPermissionsConsentCard(['read::alexa:device:all:address'])
        .getResponse()
    );
  }

  try {
    // To get the address we need an address service client
    const { deviceId } = requestEnvelope.context.System.device;
    const deviceAddressServiceClient =
      serviceClientFactory.getDeviceAddressServiceClient();

    // Only attempt to get the country & postal code.
    const address = await deviceAddressServiceClient.getCountryAndPostalCode(
      deviceId
    );

    // Only intend on looking for the country code
    // If no country, prompt user to add it
    if (address.countryCode === null) {
      return buildResponse(
        false,
        responseBuilder
          .speak(locale.ERROR.LOCATION)
          .reprompt(locale.ERROR.LOCATION)
          .withShouldEndSession(true)
          .getResponse()
      );
    }
    return buildResponse(true, address.countryCode);
  } catch (error) {
    if (error.name !== 'ServiceError') {
      console.error(`Error response: ${error.message}`);
      return buildResponse(
        false,
        responseBuilder
          .speak(locale.ERROR.UNKNOWN)
          .reprompt(locale.ERROR.UNKNOWN)
          .withShouldEndSession(true)
          .getResponse()
      );
    }
    throw error;
  }
};

module.exports = {
  getCountryCode
};
