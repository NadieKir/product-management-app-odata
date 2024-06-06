sap.ui.define(
  [
    "productmanagement/products/controller/BaseController",
    "productmanagement/products/controller/fragments/SuppliersDialog",
    "productmanagement/products/controller/fragments/AddSupplierColumnListItem",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/ui/core/Messaging",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/HashChanger",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/base/strings/formatMessage",
    "productmanagement/products/model/productModel",
    "productmanagement/products/model/categoryModel",
    "productmanagement/products/model/supplierModel",
    "productmanagement/products/model/commentModel",
    "productmanagement/products/api/countriesService",
    "productmanagement/products/model/formatter/formatter",
    "productmanagement/products/helper/helper",
    "productmanagement/products/constant/constant",
  ],
  function (
    BaseController,
    SuppliersDialog,
    AddSupplierColumnListItem,
    MessagePopover,
    MessageItem,
    Messaging,
    JSONModel,
    HashChanger,
    MessageBox,
    MessageToast,
    formatMessage,
    productModel,
    categoryModel,
    supplierModel,
    commentModel,
    countriesService,
    formatter,
    helper,
    constant
  ) {
    "use strict";

    const { getDateFromJsonDateString, getJsonDateStringFromDate, findClosestParent } = helper;
    const { NEW_SUPPLIER_LIST_ITEM_FRAGMENT_NAME } = constant;

    return BaseController.extend("productmanagement.products.controller.ProductDetailsPage", {
      formatter,

      ...SuppliersDialog,
      ...AddSupplierColumnListItem,

      /**
       * Controller's "init" lifecycle method.
       */
      onInit: function () {
        const oView = this.getView();

        oView.setModel(productModel.getModel(), "products");
        oView.setModel(categoryModel.getModel(), "categories");
        oView.setModel(supplierModel.getModel(), "suppliers");

        this.getRouter().getRoute("ProductDetailsPage").attachPatternMatched(this.onPatternMatched, this);

        this.initializeMessageManager();
      },

      /**
       * Pattern matched event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onPatternMatched: function (oEvent) {
        const oView = this.getView();
        const sProductPath = oEvent.getParameter("arguments").productPath;
        const bIsProductExisting = !!productModel
          .getModel()
          .getProperty(formatMessage("/{0}", [sProductPath]));
        const bIsPageInCreateMode = sProductPath === "create";

        if (!bIsProductExisting && !bIsPageInCreateMode) {
          this.getRouter().getTargets().display("notFoundPage");

          return;
        }

        this.setDefaultViewModel();

        if (bIsPageInCreateMode) {
          oView.unbindObject("products");

          this.setEditMode();
          this.oViewModel.setProperty("/IsCreateMode", true);
        } else {
          oView.bindObject({
            model: "products",
            path: formatMessage("/{0}", [sProductPath]),
          });
        }

        this.byId("idProductPage").setVisible(true);
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
       * Initialize message manager.
       */
      initializeMessageManager: function () {
        const oPage = this.byId("idProductPage");

        Messaging.removeAllMessages();
        Messaging.registerObject(oPage, true);

        this.getView().setModel(Messaging.getMessageModel(), "message");
      },

      /**
       * Message popover button press event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onMessagePopoverButtonPress: function (oEvent) {
        const oSourceButton = oEvent.getSource();

        if (!this.oMessagePopover) {
          this.createMessagePopover();
        }

        this.oMessagePopover.toggle(oSourceButton);
      },

      /**
       * Active message popover title press event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onActiveMessagePopoverTitlePress: function (oEvent) {
        const oPressedItem = oEvent.getParameter("item");
        const oMessageData = oPressedItem.getBindingContext("message").getObject();
        const oSourceControl = sap.ui.getCore().byId(oMessageData.getControlId());

        if (oSourceControl) {
          const oPage = this.byId("idProductPage");
          const oParentSection = findClosestParent(sap.uxap.ObjectPageSubSection, oSourceControl);

          oPage.scrollToSection(oParentSection.getId());

          this.oMessagePopover.close();
        }
      },

      /**
       * Set page to edit mode.
       */
      setEditMode: function () {
        const oCurrentDate = new Date();
        const oProductData = this.getProductData() || { Categories: [] };
        const oProductDataDeepClone = structuredClone(oProductData);

        oProductDataDeepClone.Categories = oProductDataDeepClone.Categories.map((oCategory) => oCategory.Id);
        oProductDataDeepClone.ReleaseDate = getDateFromJsonDateString(oProductDataDeepClone?.ReleaseDate);
        oProductDataDeepClone.DiscountDate = getDateFromJsonDateString(oProductDataDeepClone?.DiscountDate);
        oProductDataDeepClone.SupportData = {
          MaxReleaseDate: oCurrentDate,
          MinDiscountDate: oProductDataDeepClone.ReleaseDate,
          MaxDiscountDate: oCurrentDate,
        };

        this.getView().setModel(new JSONModel(oProductDataDeepClone), "editableProduct");

        this.oViewModel.setProperty("/IsEditMode", true);
      },

      /**
       * Add supplier button press event handler.
       */
      onAddSupplierButtonPress: async function () {
        if (!this.getModel("countries")) {
          this.initializeCountriesModel();
        }

        const oEditableProductModel = this.getModel("editableProduct");
        const aSuppliersToAdd = oEditableProductModel.getProperty("/SuppliersToAdd") || [];

        aSuppliersToAdd.push({});
        oEditableProductModel.setProperty("/SuppliersToAdd", aSuppliersToAdd);

        await this.addNewSupplierListItem();
      },

      /**
       * Initialize countries model.
       */
      initializeCountriesModel: async function () {
        const aCountries = await countriesService.getCountries();
        const oCountriesModel = new JSONModel({ Countries: aCountries });

        oCountriesModel.setSizeLimit(aCountries.length);

        this.getView().setModel(oCountriesModel, "countries");
      },

      /**
       * Add new supplier list item fragment to suppliers table.
       *
       * @async
       */
      addNewSupplierListItem: async function () {
        const aSuppliersToAdd = this.getModel("editableProduct").getProperty("/SuppliersToAdd");
        const nNewSupplierIndex = aSuppliersToAdd.length - 1;

        const oNewSupplierListItem = await this.loadFragment({
          id: formatMessage("supplierToAdd{0}", [nNewSupplierIndex]),
          name: NEW_SUPPLIER_LIST_ITEM_FRAGMENT_NAME,
        });

        oNewSupplierListItem.bindObject({
          model: "editableProduct",
          path: formatMessage("/SuppliersToAdd/{0}", [nNewSupplierIndex]),
        });

        this.byId("idSuppliersTable").addItem(oNewSupplierListItem);

        this.aNewSupplierListItems = this.aNewSupplierListItems
          ? this.aNewSupplierListItems.concat([oNewSupplierListItem])
          : [oNewSupplierListItem];
      },

      /**
       * Delete supplier button press event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onDeleteSupplierButtonPress: function (oEvent) {
        const oSourceButton = oEvent.getSource();
        const oRelatedColumnListItem = findClosestParent(sap.m.ColumnListItem, oSourceButton);

        const oEditableProductModel = this.getModel("editableProduct");
        const aSuppliersToRemove = oEditableProductModel.getProperty("/SuppliersToRemove") || [];
        const oSupplierToRemove = oSourceButton.getBindingContext("products").getObject();

        aSuppliersToRemove.push(oSupplierToRemove.Id);
        oEditableProductModel.setProperty("/SuppliersToRemove", aSuppliersToRemove);

        this.byId("idSuppliersTable").removeItem(oRelatedColumnListItem);
      },

      /**
       * Destroy new supplier list item fragments.
       *
       * @param {sap.ui.core.Fragment[]} aFragments - Fragments to destroy.
       */
      destroyNewSupplierListItemFragments: function (aFragments) {
        const aFragmentsIds = aFragments.map((oFragment) => oFragment.getId());

        aFragments.forEach((oFragment) => oFragment.destroy(true));

        this.aNewSupplierListItems = this.aNewSupplierListItems.filter(
          (oNewSupplierListItem) => !aFragmentsIds.includes(oNewSupplierListItem.getId())
        );
      },

      /**
       * Set weather product form is valid.
       */
      setProductFormValidity: function () {
        const isFieldGroupValid = this.isFieldGroupValid("ProductDataField");

        this.oViewModel.setProperty("/IsProductFormValid", isFieldGroupValid);
      },

      /**
       * ProductDataField field group validateFieldGroup event handler.
       */
      onProductDataFieldGroupValidate: function () {
        this.setProductFormValidity();
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

        const oEditedProductData = this.getModel("editableProduct").getData();
        const oPayload = {};

        let aProductSuppliers;

        for (let sKey in oEditedProductData) {
          switch (sKey) {
            case "ReleaseDate":
            case "DiscountDate":
              oPayload[sKey] = getJsonDateStringFromDate(oEditedProductData[sKey]);

              break;
            case "Categories":
              const aCategoriesIds = oEditedProductData[sKey];

              oPayload[sKey] = categoryModel.expandByIds(aCategoriesIds);

              break;
            case "SuppliersToRemove":
              const aSuppliersToRemove = oEditedProductData[sKey];
              aProductSuppliers = oPayload.Suppliers || this.getProductData("Suppliers");

              oPayload.Suppliers = aProductSuppliers.filter(
                (oSupplier) => !aSuppliersToRemove.includes(oSupplier.Id)
              );

              break;
            case "SuppliersToAdd":
              const aSuppliersToAdd = oEditedProductData[sKey].filter(Boolean);
              const aFormattedSuppliersToAdd = aSuppliersToAdd.map((oSupplier) =>
                oSupplier.Id ? oSupplier : supplierModel.create(oSupplier)
              );

              aProductSuppliers = oPayload.Suppliers || this.getProductData("Suppliers") || [];

              oPayload.Suppliers = aProductSuppliers.concat(aFormattedSuppliersToAdd);

              break;
            default:
              oPayload[sKey] = oEditedProductData[sKey];
          }
        }

        if (this.oViewModel.getProperty("/IsCreateMode")) {
          productModel.create(oPayload);

          HashChanger.getInstance().replaceHash(
            formatMessage("products/{0}", [productModel.getData().length - 1])
          );

          this.closeEditProductForm();

          return;
        }

        productModel.update(this.getProductData("Id"), oPayload);

        this.updateSuppliersTableItems();
        this.closeEditProductForm();
      },

      /**
       * Update suppliers table items to current suppliers.
       */
      updateSuppliersTableItems: function () {
        const oSuppliersTable = this.byId("idSuppliersTable");
        const oSupplierColumnListItemTemplate = oSuppliersTable.getBindingInfo("items").template.clone();

        oSuppliersTable.bindItems({
          model: "products",
          path: "Suppliers",
          template: oSupplierColumnListItemTemplate,
          templateShareable: true,
        });
      },

      /**
       * Cancel product editing button press event handler.
       */
      onCancelProductEditingButtonPress: function () {
        const bIsCurrentProductNew = this.oViewModel.getProperty("/IsCreateMode");

        if (bIsCurrentProductNew) {
          this.getRouter().navTo("ProductsOverviewPage");

          return;
        }

        const aSuppliersToRemove = this.getModel("editableProduct").getProperty("/SuppliersToRemove");

        if (aSuppliersToRemove) {
          this.updateSuppliersTableItems();
        }

        this.closeEditProductForm();
      },

      /**
       * Reset edit mode and close edit product form.
       */
      closeEditProductForm: function () {
        this.oViewModel.setProperty("/IsEditMode", false);
        this.oViewModel.setProperty("/IsProductFormValid", true);

        if (this.aNewSupplierListItems && this.aNewSupplierListItems.length) {
          this.destroyNewSupplierListItemFragments(this.aNewSupplierListItems);
        }
      },

      /**
       * Delete product button press event handler.
       */
      onDeleteProductButtonPress: function () {
        const sProductName = this.getProductData("Name");

        MessageBox.confirm(this.getLocalizedString("DeleteConfirmationText", sProductName), {
          emphasizedAction: MessageBox.Action.OK,
          onClose: (sAction) => this.onDeleteConfirmationClose(sAction),
        });
      },

      /**
       * Delete confirmation popup close event handler.
       *
       * @param {sap.m.MessageBox.Action} sAction - Chosen delete confirmation popup action.
       */
      onDeleteConfirmationClose: function (sAction) {
        if (sAction === MessageBox.Action.OK) {
          const oProductToDeleteId = this.getProductData("Id");
          const oProductToDeleteName = this.getProductData("Name");

          this.byId("idProductPage").setVisible(false);

          productModel.delete([oProductToDeleteId]);

          MessageToast.show(this.getLocalizedString("DeleteConfirmedText.Singular", oProductToDeleteName), {
            closeOnBrowserNavigation: false,
          });

          this.getRouter().navTo("ProductsOverviewPage");
        }
      },

      /**
       * Create MessagePopover instance.
       */
      createMessagePopover: function () {
        const that = this;

        this.oMessagePopover = new MessagePopover({
          activeTitlePress: this.onActiveMessagePopoverTitlePress.bind(that),
          items: {
            path: "message>/",
            template: new MessageItem({
              title: "{message>message}",
              subtitle: "{message>additionalText}",
              groupName: {
                path: "message>controlIds",
                formatter: formatter.messagePopoverGroupNameFormatter,
              },
              activeTitle: true,
              type: "{message>type}",
            }),
          },
          groupItems: true,
        });

        this.byId("idMessagePopoverButton").addDependent(this.oMessagePopover);
      },

      /**
       * Get current product data or a specific property value (if sProperty is defined).
       *
       * @param {string} [sProperty] - Property which value should be returned.
       *
       * @returns {*} - Product JSON model.
       */
      getProductData: function (sProperty) {
        const oProduct = this.getView().getBindingContext("products")?.getObject();

        return sProperty ? oProduct && oProduct[sProperty] : oProduct;
      },

      /**
       * Comment post event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onCommentPost: function (oEvent) {
        const aProductComments = this.getProductData("Comments") || [];
        const sProductId = this.getProductData("Id");
        const sCommentText = oEvent.getParameter("value");

        const oNewComment = commentModel.create({ ProductId: sProductId, Text: sCommentText });

        productModel.update(sProductId, { Comments: aProductComments.concat(oNewComment) });
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

        this.getModel("editableProduct").setProperty("/SupportData/MinDiscountDate", oReleaseDatePickerValue);

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
    });
  }
);
