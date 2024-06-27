sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";

  return {
    _model: new JSONModel({ Id: 1, Name: "John Lennon" }),

    /**
     * Get JSON model.
     *
     * @returns {sap.ui.model.json.JSONModel} - JSON model.
     */
    getModel: function () {
      return this._model;
    },
  };
});
