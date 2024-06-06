sap.ui.define([], function () {
  "use strict";

  return {
    /**
     * Get JSON model.
     *
     * @returns {sap.ui.model.json.JSONModel} - JSON model.
     */
    getModel: function () {
      return this._model;
    },

    /**
     * Set data to JSON model.
     */
    setData: function (aData) {
      this.getModel().setData(aData);
    },

    /**
     * Get data from JSON model.
     *
     * @returns {Object[]} - Model data.
     */
    getData: function () {
      return this.getModel().getData();
    },

    /**
     * Get model entry with given id.
     *
     * @param {string} sId - Search id.
     *
     * @returns {(Object | undefined)} - Model entry with given id.
     */
    getById: function (sId) {
      return this.getData().find((oItem) => oItem.Id === sId);
    },

    /**
     * Get model entries with given ids.
     *
     * @param {Array} aIds - Search ids.
     *
     * @returns {Array} - Model entries with given ids.
     */
    expandByIds: function (aIds) {
      return aIds.map((sId) => this.getById(sId));
    },
  };
});
