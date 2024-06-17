sap.ui.define(
  [
    "sap/m/MessageToast",
    "productmanagement/products/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "productmanagement/products/model/formatter/formatter",
  ],
  function (MessageToast, BaseController, JSONModel, formatter) {
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
       * Bind product with sProductId id to view.
       *
       * @param {string} sProductId - Product id.
       */
      bindProductToView: async function (sProductId) {
        const oView = this.getView();
        const oDataModel = oView.getModel();

        await oDataModel.metadataLoaded();

        const sProductKey = oDataModel.createKey("/Products", { ID: sProductId });

        const fDataRequestedHandler = () => {
          oView.setBusy(true);
        };

        const fDataReceivedHandler = (oData) => {
          const oReceivedProduct = oData.getParameter("data");

          if (!oReceivedProduct) {
            this.getRouter().getTargets().display("notFoundPage");

            return;
          }

          oView.setBusy(false);
        };

        oView.bindObject({
          path: sProductKey,
          parameters: {
            expand: "Category,Subcategories/Subcategory",
          },
          events: {
            dataRequested: fDataRequestedHandler,
            dataReceived: fDataReceivedHandler,
          },
        });
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
        const oDataModel = this.getModel();

        oDataModel.submitChanges({
          success: function () {
            MessageToast.show(this.getLocalizedString("SaveProductSuccess"));
          },
          error: function () {
            MessageToast.show(this.getLocalizedString("SaveProductError"));
          },
        });

        this.closeEditProductForm();
      },

      /**
       * Cancel product editing button press event handler.
       */
      onCancelProductEditingButtonPress: function () {
        const oDataModel = this.getModel();

        oDataModel.resetChanges();

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
       * Delete product button press event handler.
       */
      onDeleteProductButtonPress: function () {},

      /**
       * ProductDataField field group validateFieldGroup event handler.
       */
      onProductDataFieldGroupValidate: function () {
        this.setProductFormValidity();
      },

      /**
       * Set weather product form is valid.
       */
      setProductFormValidity: function () {
        const isFieldGroupValid = this.isFieldGroupValid("ProductDataField");

        this.oViewModel.setProperty("/IsProductFormValid", isFieldGroupValid);
      },

      /**
       * Get current product data or a specific property value (if sProperty is defined).
       *
       * @param {string} [sProperty] - Property which value should be returned.
       *
       * @returns {*} - Product JSON model.
       */
      getProductData: function (sProperty) {
        const oProduct = this.getView().getBindingContext()?.getObject();

        return sProperty ? oProduct && oProduct[sProperty] : oProduct;
      },
    });
  }
);
