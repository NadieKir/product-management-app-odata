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

        this.sProductId = sProductId;
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
        const oCurrentDate = new Date();
        const sProductReleaseDate = this.getProductData("ReleaseDate");

        this.oViewModel.setProperty("/MaxReleaseDate", oCurrentDate);
        this.oViewModel.setProperty("/MinDiscountDate", sProductReleaseDate);
        this.oViewModel.setProperty("/MaxDiscountDate", oCurrentDate);

        this.oViewModel.setProperty("/IsEditMode", true);
      },

      /**
       * Save product button press event handler.
       */
      onSaveProductButtonPress: function () {
        const oDataModel = this.getModel();

        this.updateProductSubcategories();

        oDataModel.submitChanges({
          success: () => {
            MessageToast.show(this.getLocalizedString("SaveProductSuccess"));
          },
          error: () => {
            MessageToast.show(this.getLocalizedString("SaveProductError"));
          },
        });

        oDataModel.refresh(true);

        this.closeEditProductForm();
      },

      /**
       * Category select change event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onCategorySelectChange: function (oEvent) {
        const oSelect = oEvent.getSource();
        const sSelectedCategoryId = oSelect.getSelectedKey();
        const oProductContext = oSelect.getBindingContext();

        oProductContext.getModel().setProperty("Category_ID", sSelectedCategoryId, oProductContext);
      },

      /**
       * Update product subcategories.
       */
      updateProductSubcategories: function () {
        const aSelectedSubcategoriesIds = this.byId("idProductSubcategoriesMultiComboBox").getSelectedKeys();
        const aProductSubcategoriesIds = this.getProductData("Subcategories", "/ID");

        const aSubcategoriesToAdd = aSelectedSubcategoriesIds.filter(
          (sSubcategoryId) => !aProductSubcategoriesIds.includes(sSubcategoryId)
        );

        const aSubcategoriesToRemove = this.getProductData("Subcategories").filter((sSubcategoryPath) => {
          const sId = this.getModel().getProperty("/" + sSubcategoryPath + "/Subcategory/ID");

          return !aSelectedSubcategoriesIds.includes(sId);
        });

        aSubcategoriesToAdd.length && this.addSubcategories(aSubcategoriesToAdd);
        aSubcategoriesToRemove.length && this.removeSubcategories(aSubcategoriesToRemove);
      },

      /**
       * Add subcategories to product.
       *
       * @param {string[]} aSubcategoriesToAdd - Ids of subcategories to add to current product.
       */
      addSubcategories: function (aSubcategoriesToAdd) {
        const oDataModel = this.getModel();

        aSubcategoriesToAdd.forEach((sSubcategoryId) => {
          const oEntry = {
            Product_ID: this.sProductId,
            Subcategory_ID: sSubcategoryId,
          };

          oDataModel.createEntry("/ProductsSubcategories", {
            properties: oEntry,
          });
        });
      },

      /**
       * Remove subcategories from product.
       *
       * @param {string[]} aSubcategoriesToAdd - Ids of subcategories to remove from current product.
       */
      removeSubcategories: function (aSubcategoriesToRemove) {
        const oDataModel = this.getModel();

        aSubcategoriesToRemove.forEach((sPath) => {
          oDataModel.remove("/" + sPath);
        });
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
       * Release date picker change event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onReleaseDatePickerChange: function (oEvent) {
        const oReleaseDatePickerValue = oEvent.getSource().getDateValue();
        const oDiscountDatePicker = this.byId("idDiscountDate");
        const oDiscountDatePickerValue = oDiscountDatePicker.getDateValue();

        this.oViewModel.setProperty("/MinDiscountDate", oReleaseDatePickerValue);

        if (oDiscountDatePickerValue && oReleaseDatePickerValue > oDiscountDatePickerValue) {
          oDiscountDatePicker.fireValidationError({
            element: oDiscountDatePicker,
            property: "value",
            message: this.getLocalizedString("DiscountDateValidation"),
          });

          return;
        }

        if (!oDiscountDatePicker.isValidValue()) {
          oDiscountDatePicker.fireValidationSuccess({
            element: oDiscountDatePicker,
            property: "value",
          });
        }
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
       * @param {string} [sInnerProperty] - Inner property which value should be returned.
       *
       * @returns {*} - Product full data or specified property.
       */
      getProductData: function (sProperty, sInnerProperty) {
        const sPath = sProperty
          ? `/Products(guid'${this.sProductId}')/${sProperty}`
          : `/Products(guid'${this.sProductId}')`;

        const vData = this.getModel().getProperty(sPath);

        if (!sInnerProperty) {
          return vData;
        }

        switch (sProperty) {
          case "Subcategories":
            return vData.map((sPath) =>
              this.getModel().getProperty(`/${sPath}/Subcategory${sInnerProperty}`)
            );

          default:
            return vData;
        }
      },
    });
  }
);
