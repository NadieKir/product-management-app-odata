sap.ui.define(
  [
    "productmanagement/products/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "productmanagement/products/model/formatter/formatter",
  ],
  function (BaseController, JSONModel, formatter) {
    "use strict";

    return BaseController.extend("productmanagement.products.controller.ProductDetailsPage", {
      formatter,

      /**
       * Controller's "init" lifecycle method.
       */
      onInit: function () {
        this.getRouter().getRoute("ProductDetailsPage").attachPatternMatched(this.onPatternMatched, this);
      },

      /**
       * Pattern matched event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onPatternMatched: function (oEvent) {
        const sProductId = oEvent.getParameter("arguments").productId;
        const bIsPageInCreateMode = sProductId === "create";

        this.setDefaultViewModel();

        if (bIsPageInCreateMode) {
          this.oViewModel.setProperty("/IsCreateMode", true);

          return;
        }

        const oView = this.getView();
        const oDataModel = oView.getModel();

        const fSuccessHandler = (oProduct) => {
          const sProductKey = oDataModel.createKey("/Products", { ID: sProductId });

          oView.bindObject({
            path: sProductKey,
          });

          this.byId("idProductPage").setVisible(true);
        };

        const fErrorHandler = (oError) => {
          this.getRouter().getTargets().display("notFoundPage");
        };

        oDataModel.read(`/Products(${sProductId})`, {
          success: fSuccessHandler,
          error: fErrorHandler,
        });
      },

      /**
       * Set productDetailsView model to default state.
       */
      setDefaultViewModel: function () {
        const oDefaultProductDetailsViewModel = new JSONModel({
          IsCreateMode: false,
          IsEditMode: false,
          IsProductFormValid: true,
        });

        this.getView().setModel(oDefaultProductDetailsViewModel, "productDetailsView");

        this.oViewModel = this.getModel("productDetailsView");
      },

      /**
       * Cancel product editing button press event handler.
       */
      onCancelProductEditingButtonPress: function () {
        this.closeEditProductForm();
      },

      /**
       * Reset edit mode and close edit product form.
       */
      closeEditProductForm: function () {
        this.oViewModel.setProperty("/IsEditMode", false);
        this.oViewModel.setProperty("/IsProductFormValid", true);
      },

      /**
       * Set page to edit mode.
       */
      setEditMode: function () {
        this.oViewModel.setProperty("/IsEditMode", true);
      },

      /**
       * Save product button press event handler.
       */
      onSaveProductButtonPress: function () {
        this.closeEditProductForm();
      },

      /**
       * Delete product button press event handler.
       */
      onDeleteProductButtonPress: function () {},
    });
  }
);
