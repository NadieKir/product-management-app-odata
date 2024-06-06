sap.ui.define(
  ["sap/ui/model/json/JSONModel", "productmanagement/products/model/baseModel"],
  function (JSONModel, baseModel) {
    "use strict";

    return {
      ...baseModel,

      _model: new JSONModel(),
    };
  }
);
