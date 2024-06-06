sap.ui.define(["productmanagement/products/controller/BaseController"], function (BaseController) {
  "use strict";

  return BaseController.extend("productmanagement.products.controller.NotFoundPage", {
    /**
     * Navigate to product overview page.
     */
    onNavToProductsOverviewPage: function () {
      this.getRouter().navTo("ProductsOverviewPage");
    },
  });
});
