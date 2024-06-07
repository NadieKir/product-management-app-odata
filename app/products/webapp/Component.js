sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "productmanagement/products/model/i18nModel",
    "productmanagement/products/model/customType/customType",
  ],
  function (UIComponent, i18nModel) {
    "use strict";

    return UIComponent.extend("productmanagement.products.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        UIComponent.prototype.init.apply(this, arguments);

        this.getRouter().initialize();

        i18nModel.setModel(this.getModel("i18n"));
      },
    });
  }
);
