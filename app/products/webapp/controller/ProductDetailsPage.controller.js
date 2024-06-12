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
        this.setDefaultViewModel();
        this.byId("idProductPage").setVisible(true);

        const sProductId = oEvent.getParameter("arguments").productId;

        if (sProductId === "create") {
          this.oViewModel.setProperty("/IsCreateMode", true);

          return;
        }

        this.bindProductToView(sProductId);
      },

      /**
       * Bind product with sProductId id to view.
       *
       * @param {string} sProductId - Product id.
       */
      bindProductToView: async function (sProductId) {
        const oView = this.getView();
        const oDataModel = oView.getModel();

        await oDataModel.metadataLoaded();

        const sProductKey = oDataModel.createKey("/Products", { ID: sProductId });

        const fDataRequestedHandler = () => oView.setBusy(true);

        const fDataReceivedHandler = (oData) => {
          const oReceivedProduct = oData.getParameter("data");

          if (!oReceivedProduct) {
            this.getRouter().getTargets().display("notFoundPage");
          }

          oView.setBusy(false);
        };

        oView.bindObject({
          path: sProductKey,
          events: {
            dataRequested: fDataRequestedHandler,
            dataReceived: fDataReceivedHandler,
          },
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
