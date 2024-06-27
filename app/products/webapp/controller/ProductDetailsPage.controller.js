sap.ui.define(
  [
    "productmanagement/products/controller/BaseController",
    "productmanagement/products/controller/fragments/SelectSuppliersDialog",
    "productmanagement/products/controller/fragments/CreateSupplierDialog",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "productmanagement/products/model/formatter/formatter",
    "productmanagement/products/model/userModel",
    "productmanagement/products/constant/constant",
  ],
  function (
    BaseController,
    SelectSuppliersDialog,
    CreateSupplierDialog,
    JSONModel,
    MessageToast,
    Filter,
    FilterOperator,
    formatter,
    userModel,
    constant
  ) {
    "use strict";

    const { SUPPLIERS_DIALOG_NAME, CREATE_SUPPLIER_DIALOG_NAME } = constant;

    return BaseController.extend("productmanagement.products.controller.ProductDetailsPage", {
      formatter,

      ...SelectSuppliersDialog,
      ...CreateSupplierDialog,

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
          IsSupplierFormValid: true,
        });

        this.getView().setModel(oDefaultProductDetailsViewModel, "productDetailsView");

        this.oViewModel = this.getModel("productDetailsView");
      },

      /**
       * Bind product with sProductId id to view.
       *
       * @async
       *
       * @param {string} sProductId - Product id.
       */
      bindProductToView: async function (sProductId) {
        const oView = this.getView();
        const oDataModel = oView.getModel();

        await oDataModel.metadataLoaded();

        const sProductKey = oDataModel.createKey("/Products", { ID: sProductId });

        oView.bindObject({
          path: sProductKey,
          parameters: {
            expand: "Category,Subcategories/Subcategory,Suppliers/Supplier",
          },
          events: {
            dataRequested: () => oView.setBusy(true),
            dataReceived: (oData) => this.onProductDataReceived(oData),
          },
        });
      },

      /**
       * Bind product dataReceived event handler.
       *
       * @param {Object} oData - Received data.
       */
      onProductDataReceived: function (oData) {
        const oReceivedProduct = oData.getParameter("data");

        if (!oReceivedProduct) {
          this.getRouter().getTargets().display("notFoundPage");

          return;
        }

        this.setProductSuppliersTableItems(oReceivedProduct.ID);

        this.getView().setBusy(false);
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
        const oProductClone = structuredClone(this.getProductData());

        this.getView().setModel(new JSONModel(oProductClone), "editableProduct");

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
        const oEditableProductModel = this.getModel("editableProduct");
        const oCurrentProductContext = this.getView().getBindingContext();
        const oCurrentProduct = oCurrentProductContext.getObject();

        for (let sKey in oCurrentProduct) {
          switch (sKey) {
            case "Subcategories":
              this.updateProductSubcategories();

              break;
            case "Category":
            case "Suppliers":
            case "Comments":
              break;
            default:
              const vOriginalValue = oDataModel.getProperty(sKey, oCurrentProductContext);
              const vNewValue = oEditableProductModel.getProperty(`/${sKey}`);

              if (vOriginalValue !== vNewValue) {
                oDataModel.setProperty(sKey, vNewValue, oCurrentProductContext);
              }
          }
        }

        oDataModel.submitChanges({
          success: () => this.onSaveProductSuccess(),
          error: () => MessageToast.show(this.getLocalizedString("SaveProductError")),
        });
      },

      /**
       * Save product success event handler.
       */
      onSaveProductSuccess: function () {
        const oDataModel = this.getModel();

        oDataModel.refresh(true);

        this.closeEditProductForm();

        MessageToast.show(this.getLocalizedString("SaveProductSuccess"));
      },

      /**
       * Category Select change event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onCategorySelectChange: function (oEvent) {
        const oSelect = oEvent.getSource();
        const sSelectedCategoryId = oSelect.getSelectedKey();

        this.clearSubcategoriesMultiComboBoxSelectedItems();
        this.setSubcategoriesMultiComboBoxItems(sSelectedCategoryId);
      },

      /**
       * Subcategories MultiComboBox selectionChange event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onSubcategoriesMultiComboBoxChange: function (oEvent) {
        const bIsSubcategoriesMultiComboBoxValid = this.validateRequiredMultiComboBox(oEvent);
        const bIsProductFormValid = this.oViewModel.getProperty("/IsProductFormValid");

        if (bIsProductFormValid && !bIsSubcategoriesMultiComboBoxValid) {
          this.oViewModel.setProperty("/IsProductFormValid", false);
        }
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
          const oPayload = {
            Product_ID: this.sProductId,
            Subcategory_ID: sSubcategoryId,
          };

          oDataModel.create("/ProductsSubcategories", oPayload);
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
       *
       * @async
       */
      onSelectSupplierButtonPress: async function () {
        const oSelectSuppliersDialog = await this.getDialog(SUPPLIERS_DIALOG_NAME);

        this.setSelectSuppliersDialogItems(oSelectSuppliersDialog);

        oSelectSuppliersDialog.open();
      },

      /**
       * Set suppliers dialog items.
       *
       * @param {sap.m.Dialog} oSelectSuppliersDialog - Suppliers dialog.
       */
      setSelectSuppliersDialogItems: function (oSelectSuppliersDialog) {
        const aSelectSuppliersDialogItems = oSelectSuppliersDialog.getBinding("items");

        const aProductSuppliers = this.byId("idSuppliersTable").getItems();
        const aProductSuppliersIds = aProductSuppliers.map((oSupplier) =>
          oSupplier.getBindingContext().getProperty("Supplier_ID")
        );

        const aFilters = aProductSuppliersIds.map(
          (sProductSupplierId) => new Filter("ID", FilterOperator.NE, sProductSupplierId)
        );

        aSelectSuppliersDialogItems.filter(
          new Filter({
            filters: aFilters,
            and: true,
          })
        );
      },

      /**
       * Create supplier button press event handler.
       *
       * @async
       */
      onCreateSupplierButtonPress: async function () {
        const oCreateSupplierDialog = await this.getDialog(CREATE_SUPPLIER_DIALOG_NAME);

        oCreateSupplierDialog.open();
      },

      /**
       * Delete supplier button press event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onDeleteSupplierButtonPress: function (oEvent) {
        const oSupplierToRemoveContext = oEvent.getSource().getBindingContext();
        const oSupplierToRemoveId = oSupplierToRemoveContext.getObject().ID;

        const oSuppliersTableItems = this.byId("idSuppliersTable").getBinding("items");
        const oRemoveSupplierFilter = new Filter("ID", FilterOperator.NE, oSupplierToRemoveId);
        const oFilter = new Filter({
          filters: oSuppliersTableItems.aFilters.concat(oRemoveSupplierFilter),
          and: true,
        });

        oSupplierToRemoveContext.delete();
        oSuppliersTableItems.filter(oFilter);
      },

      /**
       * Cancel product editing button press event handler.
       */
      onCancelProductEditingButtonPress: function () {
        const oDataModel = this.getModel();

        oDataModel.resetChanges(null, true, true);

        this.closeEditProductForm();
      },

      /**
       * Reset edit mode and close edit product form.
       */
      closeEditProductForm: function () {
        const oSuppliersTableItems = this.byId("idSuppliersTable").getBinding("items");
        const oSuppliersTableDefaultFilter = oSuppliersTableItems.aFilters[0];

        oSuppliersTableItems.filter(oSuppliersTableDefaultFilter);

        this.oViewModel.setProperty("/IsEditMode", false);
        this.oViewModel.setProperty("/IsProductFormValid", true);
      },

      /**
       * ProductDataField field group validateFieldGroup event handler.
       */
      onProductDataFieldGroupValidate: function () {
        const isFieldGroupValid = this.isFieldGroupValid("ProductDataField");

        this.oViewModel.setProperty("/IsProductFormValid", isFieldGroupValid);
      },

      /**
       * Comment post event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onCommentPost: function (oEvent) {
        const oDataModel = this.getModel();
        const sCommentText = oEvent.getParameter("value");
        const sAuthorName = userModel.getModel().getProperty("/Name");

        const oPayload = {
          Product_ID: this.sProductId,
          Text: sCommentText,
          Author: sAuthorName,
        };

        oDataModel.create("/Comments", oPayload, {
          success: () => MessageToast.show(this.getLocalizedString("CreateCommentSuccess")),
          error: () => MessageBox.error(this.getLocalizedString("CreateCommentError")),
        });
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
