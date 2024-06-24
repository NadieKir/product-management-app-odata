sap.ui.define(
  ["sap/ui/model/json/JSONModel", "productmanagement/products/api/countriesService"],
  function (JSONModel, countriesService) {
    "use strict";

    return {
      _countries: null,

      /**
       * Get countries JSON model.
       *
       * @returns {sap.ui.model.json.JSONModel} - JSON model.
       */
      getModel: async function () {
        if (!this._countries) {
          await this.setCountries();
        }

        const oCountriesModel = new JSONModel({ Countries: this._countries });

        oCountriesModel.setSizeLimit(this._countries.length);

        return oCountriesModel;
      },

      /**
       * Set countries.
       */
      setCountries: async function () {
        this._countries = await countriesService.getCountries();
      },
    };
  }
);
