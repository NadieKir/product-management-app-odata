sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "productmanagement/products/model/i18nModel",
    "productmanagement/products/constant/constant",
    "productmanagement/products/model/customType/customType",
  ],
  function (UIComponent, i18nModel, constant) {
    "use strict";

    const { O_DATA_DEFERRED_GROUPS } = constant;

    return UIComponent.extend("productmanagement.products.Component", {
      metadata: {
        manifest: "json",
      },

      /**
       * Component.js init method.
       */
      init: function () {
        UIComponent.prototype.init.apply(this, arguments);

        this.getRouter().initialize();

        i18nModel.setModel(this.getModel("i18n"));

        this.configureODataModel();
      },

      /**
       * Configure oData model.
       */
      configureODataModel: function () {
        const oDataModel = this.getModel();
        const aDefaultDeferredGroups = oDataModel.getDeferredGroups();

        oDataModel.setDeferredGroups(aDefaultDeferredGroups.concat(O_DATA_DEFERRED_GROUPS));
      },
    });
  }
);
