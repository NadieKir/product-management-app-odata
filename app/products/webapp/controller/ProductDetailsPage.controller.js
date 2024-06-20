sap.ui.define(
  [
    "productmanagement/products/controller/BaseController",
    "productmanagement/products/controller/fragments/SuppliersDialog",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "productmanagement/products/model/formatter/formatter",
    "productmanagement/products/constant/constant",
    "productmanagement/products/api/countriesService",
  ],
  function (
    BaseController,
    SuppliersDialog,
    JSONModel,
    MessageToast,
    Filter,
    FilterOperator,
    formatter,
    constant,
    countriesService
  ) {
    "use strict";

    const { SUPPLIERS_DIALOG_NAME } = constant;

    return BaseController.extend("productmanagement.products.controller.ProductDetailsPage", {
      formatter,

      ...SuppliersDialog,

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

          this.setProductSuppliersTableItems(sProductId);

          oView.setBusy(false);
        };

        oView.bindObject({
          path: sProductKey,
          parameters: {
            expand: "Category,Subcategories/Subcategory,Suppliers/Supplier",
          },
          events: {
            dataRequested: fDataRequestedHandler,
            dataReceived: fDataReceivedHandler,
          },
        });
      },

      /**
       * Set current product suppliers to suppliers table.
       *
       * @param {string} sProductId - Product id.
       */
      setProductSuppliersTableItems: function (sProductId) {
        const oFilter = new Filter("Product_ID", FilterOperator.EQ, sProductId);

        this.byId("idSuppliersTable").getBinding("items").filter(oFilter);
      },

      /**
       * Set page to edit mode.
       */
      setEditMode: function () {
        const oCurrentDate = new Date();
        const sProductReleaseDate = this.getProductData("ReleaseDate");
        const sProductCategoryId = this.getProductData("Category_ID");

        this.setSubcategoriesMultiComboBoxItems(sProductCategoryId);

        this.oViewModel.setProperty("/MaxReleaseDate", oCurrentDate);
        this.oViewModel.setProperty("/MinDiscountDate", sProductReleaseDate);
        this.oViewModel.setProperty("/MaxDiscountDate", oCurrentDate);

        this.oViewModel.setProperty("/IsEditMode", true);
      },

      /**
       * Save product button press event handler.
       */
      onSaveProductButtonPress: function () {
        const aProductDataFields = this.getView().getControlsByFieldGroupId("ProductDataField");
        const bAreProductDataRequiredFieldsFilled = this.validateRequiredFieldsToBeFilled(aProductDataFields);

        if (!bAreProductDataRequiredFieldsFilled) {
          this.oViewModel.setProperty("/IsProductFormValid", false);

          return;
        }

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

        this.setSubcategoriesMultiComboBoxItems(sSelectedCategoryId);
        this.clearSubcategoriesMultiComboBoxSelectedItems();
      },

      /**
       * Set subcategories of given category to items aggregation of subcategories MultiComboBox.
       *
       * @param {string} sCategoryId - Сategory id.
       */
      setSubcategoriesMultiComboBoxItems: function (sCategoryId) {
        const aSubcategoriesMultiComboBox = this.byId("idProductSubcategoriesMultiComboBox");
        const oFilter = new Filter("SubcategoryFor_ID", FilterOperator.EQ, sCategoryId);

        aSubcategoriesMultiComboBox.getBinding("items").filter(oFilter);
      },

      /**
       * Clear subcategories MultiComboBox selected items.
       */
      clearSubcategoriesMultiComboBoxSelectedItems: function () {
        const aSubcategoriesMultiComboBox = this.byId("idProductSubcategoriesMultiComboBox");

        aSubcategoriesMultiComboBox.setSelectedItems([]);
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
       * Add supplier button press event handler.
       */
      onAddSupplierButtonPress: async function () {
        const oSuppliersDialog = await this.getDialog(SUPPLIERS_DIALOG_NAME);

        this.setSuppliersDialogItems(oSuppliersDialog);

        oSuppliersDialog.open();
      },

      /**
       * Set suppliers dialog items.
       *
       * @param {sap.m.Dialog} oSuppliersDialog - Suppliers dialog.
       */
      setSuppliersDialogItems: function (oSuppliersDialog) {
        const aSuppliersDialogItems = oSuppliersDialog.getBinding("items");

        const aProductSuppliers = this.byId("idSuppliersTable").getItems();
        const aProductSuppliersIds = aProductSuppliers.map((oSupplier) =>
          oSupplier.getBindingContext().getProperty("Supplier_ID")
        );

        const aFilters = aProductSuppliersIds.map(
          (sProductSupplierId) => new Filter("ID", FilterOperator.NE, sProductSupplierId)
        );

        aSuppliersDialogItems.filter(
          new Filter({
            filters: aFilters,
            and: true,
          })
        );
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
        const sProductPath = this.getView().getBindingContext().getPath();
        const sPath = sProperty ? `${sProductPath}/${sProperty}` : sProductPath;
        const vData = this.getModel().getProperty(sPath);

        if (!sInnerProperty) {
          return vData;
        }

        switch (sProperty) {
          case "Subcategories":
            return vData.map((sPath) =>
              this.getModel().getProperty(`/${sPath}/Subcategory${sInnerProperty}`)
            );

          case "Suppliers":
            return vData.map((sPath) => this.getModel().getProperty(`/${sPath}/Supplier${sInnerProperty}`));

          default:
            return vData;
        }
      },
    });
  }
);
