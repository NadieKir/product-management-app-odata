sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "productmanagement/products/model/i18nModel",
    "productmanagement/products/constant/constant",
    "productmanagement/products/model/customType/customType",
  ],
  function (UIComponent, i18nModel, constant) {
    "use strict";

    const { CREATE_SUPPLIER_GROUP } = constant;

    return UIComponent.extend("productmanagement.products.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        UIComponent.prototype.init.apply(this, arguments);

        this.getRouter().initialize();

        i18nModel.setModel(this.getModel("i18n"));

        this.configureODataModel();
      },

      configureODataModel: function () {
        const oDataModel = this.getModel();
        const aDefaultDeferredGroups = oDataModel.getDeferredGroups();
        const aDeferredGroups = [CREATE_SUPPLIER_GROUP];

        oDataModel.setDeferredGroups(aDefaultDeferredGroups.concat(aDeferredGroups));
      },
    });
  }
);
