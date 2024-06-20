sap.ui.define(["sap/base/strings/formatMessage"], function (formatMessage) {
  "use strict";

  const BASE_URL = "https://api.countrystatecity.in/v1/countries";
  const API_KEY = "dDl6dzhvclAzQTh0em1KVmpacFdUVDVKZTkxYW1GZ2t0MG5GZUpiTg==";

  /**
   * Fetch for countries API.
   *
   * @async
   *
   * @param {string} sUrl - Url to fetch.
   *
   * @returns {*} - Fetched data or error handler result.
   */
  async function handleFetch(sUrl) {
    const oRequestOptions = {
      headers: {
        "X-CSCAPI-KEY": API_KEY,
      },
    };

    try {
      const oResponse = await fetch(sUrl, oRequestOptions);

      return oResponse.ok ? await oResponse.json() : [];
    } catch (error) {
      return [];
    }
  }

  return {
    /**
     * Get a list of all countries
     *
     * @async
     *
     * @returns {Object[]} - List of all countries.
     */
    getCountries: async function () {
      const aCountries = await handleFetch(BASE_URL);

      return aCountries;
    },

    /**
     * Get a list of states within country.
     *
     * @async
     *
     * @param {string} sCountryIso2Code - ISO2 code of country.
     *
     * @returns {Object[]} - List of states within country.
     */
    getCountryStates: async function (sCountryIso2Code) {
      if (!sCountryIso2Code) {
        return [];
      }

      const sUrl = formatMessage("{0}/{1}/states", [BASE_URL, sCountryIso2Code]);
      const aStates = await handleFetch(sUrl);

      return aStates;
    },

    /**
     * Get a list of cities within country and state.
     *
     * @async
     *
     * @param {string} sCountryIso2Code - ISO2 code of country.
     * @param {string} sStateIso2Code - ISO2 code of state.
     *
     * @returns {Object[]} - List of cities within country and state.
     */
    getStateCities: async function (sCountryIso2Code, sStateIso2Code) {
      if (!sCountryIso2Code || !sStateIso2Code) {
        return [];
      }

      const sUrl = formatMessage("{0}/{1}/states/{2}/cities", [BASE_URL, sCountryIso2Code, sStateIso2Code]);
      const aCities = await handleFetch(sUrl);

      return aCities;
    },
  };
});
