sap.ui.define(
  [
    "productmanagement/products/controller/BaseController",
    "productmanagement/products/controller/fragments/GroupDialog",
    "productmanagement/products/controller/fragments/SortDialog",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "productmanagement/products/model/formatter/formatter",
    "productmanagement/products/constant/constant",
    "productmanagement/products/helper/helper",
    "productmanagement/products/model/productModel",
    "productmanagement/products/model/categoryModel",
    "productmanagement/products/model/supplierModel",
  ],
  function (
    BaseController,
    GroupDialog,
    SortDialog,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    MessageBox,
    MessageToast,
    formatter,
    constant,
    helper,
    productModel,
    categoryModel,
    supplierModel
  ) {
    "use strict";

    const { DEFAULT_PRODUCTS_SORTER, SORT_DIALOG_NAME, GROUP_DIALOG_NAME } = constant;
    const { areIntersecting } = helper;

    return BaseController.extend("productmanagement.products.controller.ProductsOverviewPage", {
      formatter,

      ...GroupDialog,
      ...SortDialog,

      /**
       * Controller's "init" lifecycle method.
       */
      onInit: function () {
        const oView = this.getView();
        const oProductsOverviewViewModel = new JSONModel({
          SelectedProducts: [],
          MaxReleaseDate: new Date(),
        });

        oView.setModel(oProductsOverviewViewModel, "productsOverviewView");
        oView.setModel(productModel.getModel(), "products");
        oView.setModel(categoryModel.getModel(), "categories");
        oView.setModel(supplierModel.getModel(), "suppliers");

        this.oViewModel = oView.getModel("productsOverviewView");
      },

      /**
       * Controller's "before rendering" lifecycle method.
       */
      onBeforeRendering: function () {
        //this.setProductsTableSorter(DEFAULT_PRODUCTS_SORTER.PATH, DEFAULT_PRODUCTS_SORTER.DESCENDING);
      },

      /**
       * Products table selection change event handler.
       */
      onTableSelectionChange: function () {
        const aSelectedItems = this.byId("idProductsTable").getSelectedItems();

        const aSelectedItemsData = aSelectedItems.map((oItem) =>
          oItem.getBindingContext().getObject()
        );

        this.oViewModel.setProperty("/SelectedProducts", aSelectedItemsData);
      },

      /**
       * Product list item press event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onColumnListItemPress: function (oEvent) {
        const oSource = oEvent.getSource();
        const sProductPath = oSource.getBindingContext().getPath().substr(1);

        this.getRouter().navTo("ProductDetailsPage", {
          productPath: sProductPath,
        });
      },

      /**
       * Create product button press event handler.
       */
      onCreateProductButtonPress: function () {
        this.getRouter().navTo("ProductDetailsPage", {
          productPath: "create",
        });
      },

      /**
       * Delete product button press event handler.
       */
      onDeleteProductButtonPress: function () {
        const aProductsToDelete = this.oViewModel.getProperty("/SelectedProducts");
        const aProductsToDeleteIds = aProductsToDelete.map((oProduct) => oProduct.Id);

        const sProductsToDeleteInfo =
          aProductsToDelete.length === 1
            ? aProductsToDelete[0].Name
            : this.getLocalizedString("Products.WithAmount", aProductsToDelete.length);

        MessageBox.confirm(this.getLocalizedString("DeleteConfirmationText", sProductsToDeleteInfo), {
          emphasizedAction: MessageBox.Action.OK,
          onClose: (sAction) =>
            this.onDeleteProductConfirmationClose(sAction, aProductsToDeleteIds, sProductsToDeleteInfo),
        });
      },

      /**
       * Delete confirmation popup close event handler.
       *
       * @param {sap.m.MessageBox.Action} sAction - Chosen delete confirmation popup action.
       * @param {string[]} aProductsToDeleteIds - Ids of products to delete.
       * @param {string} sProductsToDeleteInfo - Information about products to delete (its name or their amount).
       */
      onDeleteProductConfirmationClose: function (sAction, aProductsToDeleteIds, sProductsToDeleteInfo) {
        if (sAction === MessageBox.Action.OK) {
          const oODataModel = this.getView().getModel();
          const aKeys = aProductsToDeleteIds.map(sId => "/Products('" + sId + "')");

          aKeys.forEach(sKey =>  oODataModel.remove(sKey, {
            success: () => {
              const sMessageToastText = this.getLocalizedString(
                aProductsToDeleteIds.length === 1 ? "DeleteConfirmedText.Singular" : "DeleteConfirmedText.Plural",
                sProductsToDeleteInfo
              );

              MessageToast.show(sMessageToastText);

              this.oViewModel.setProperty("/SelectedProducts", []);
              this.updateProductsTableSelections();
            },
            error: () => {
              MessageBox.error(this.i18n("DeleteProductError"));
            },
          }))
        }
      },

      /**
       * Product filter bar search event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onFilterBarSearch: function (oEvent) {
        const oProductsTableBinding = this.byId("idProductsTable").getBinding("items");
        const aFilterFields = oEvent.getParameter("selectionSet");

        const oFilter = this.createFilterFromFields(aFilterFields);

        oProductsTableBinding.filter(oFilter);
        this.updateProductsTableSelections();
      },

      /**
       * Product filter bar reset event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onFilterBarReset: function (oEvent) {
        const oProductsTableBinding = this.byId("idProductsTable").getBinding("items");
        const aFilterFields = oEvent.getParameter("selectionSet");

        this.resetFields(aFilterFields);
        oProductsTableBinding.filter();

        this.updateProductsTableSelections();
      },

      /**
       * @async
       *
       * Products sort button press event handler.
       */
      onSortButtonPressed: async function () {
        const oSortDialog = await this.getDialog(SORT_DIALOG_NAME);

        oSortDialog.open();
      },

      /**
       * @async
       *
       * Products group button press event handler.
       */
      onGroupButtonPressed: async function () {
        const oGroupDialog = await this.getDialog(GROUP_DIALOG_NAME);

        oGroupDialog.open();
      },

      /**
       * Create filter from fields in filter bar (all filters will be applied together).
       *
       * @param {sap.ui.core.mvc.Controller[]} aFilterFields - Filter bar fields.
       *
       * @returns {sap.ui.model.Filter} - Filter from fields in filter bar.
       */
      createFilterFromFields: function (aFilterFields) {
        const aFilters = [];

        for (let oFilterField of aFilterFields) {
          const sFilterName = oFilterField.getProperty("name");
          const uFilterFieldValue = this.getFieldValue(oFilterField);

          if (uFilterFieldValue === null) continue;

          switch (sFilterName) {
            case "Name":
              aFilters.push(
                new Filter({
                  path: sFilterName,
                  operator: FilterOperator.Contains,
                  value1: uFilterFieldValue,
                  caseSensitive: false,
                })
              );

              break;

            case "Suppliers":
            case "Categories":
              aFilters.push(
                new Filter({
                  path: sFilterName,
                  test: (aValue) =>
                    areIntersecting(
                      aValue.map((oItem) => oItem.Id),
                      uFilterFieldValue
                    ),
                })
              );

              break;

            case "ReleaseDate":
              aFilters.push(
                new Filter({
                  path: sFilterName,
                  operator: FilterOperator.BT,
                  value1: `\/Date(${uFilterFieldValue.startDate.getTime()})\/`,
                  value2: `\/Date(${uFilterFieldValue.endDate.getTime()})\/`,
                })
              );

              break;

            default:
              throw new Error(`Can't filter by product property '${sFilterName}'`);
          }
        }

        return new Filter({
          filters: aFilters,
          and: true,
        });
      },

      /**
       * Reset filter bar fields.
       *
       * @param {sap.ui.core.mvc.Controller[]}} aFilterFields - Filter bar fields to reset.
       */
      resetFields: function (aFilterFields) {
        aFilterFields.forEach((oFilterField) => {
          const sFilterFieldControlName = oFilterField.getMetadata().getName();

          switch (sFilterFieldControlName) {
            case "sap.m.Input":
            case "sap.m.DateRangeSelection":
              oFilterField.setValue(null);

              break;

            case "sap.m.MultiComboBox":
              oFilterField.removeAllSelectedItems();

              break;

            case "sap.m.MultiInput":
              oFilterField.removeAllTokens();

              break;

            default:
              throw new Error(`Can't reset input with name '${sFilterFieldControlName}'`);
          }
        });
      },

      /**
       * Set products table sorter.
       *
       * @param {string} sPath - Property path to sort by.
       * @param {boolean} bIsDescending - Whether sorting should be applied in descending order.
       */
      setProductsTableSorter: function (sPath, bIsDescending) {
        const oTableBinding = this.byId("idProductsTable").getBinding("items");
        const oGrouping = this.oViewModel.getProperty("/grouping");
        const oSorter = new Sorter(sPath, bIsDescending);

        oTableBinding.sort([oGrouping || {}, oSorter]);

        this.oViewModel.setProperty("/sorter", oSorter);
        // oTableBinding.refresh();
      },

      /**
       * Update products table selections.
       */
      updateProductsTableSelections: function () {
        const oProductsTable = this.byId("idProductsTable");
        const aProductsTableItems = oProductsTable.getItems();
        const aSelectedProducts = this.oViewModel.getProperty("/SelectedProducts");

        oProductsTable.removeSelections();

        aSelectedProducts.forEach((oSelectedProduct) => {
          const oProductToMarkSelected = aProductsTableItems.find((oProduct) => {
            const oProductData = oProduct.getBindingContext().getObject();

            return oProductData.Id === oSelectedProduct.Id;
          });

          oProductsTable.setSelectedItem(oProductToMarkSelected);
        });
      },

      /**
       * Delete products.
       *
       * @param {string[]} aProductsToDeleteIds - Products to delete ids.
       */
      // deleteProducts: function (aProductsToDeleteIds) {
      //   productModel.delete(aProductsToDeleteIds);

      //   // this.getView().setModel(productModel.getModel(), "products");
      //   this.oViewModel.setProperty("/SelectedProducts", []);

      //   this.updateProductsTableSelections();
      // },
    });
  }
);
