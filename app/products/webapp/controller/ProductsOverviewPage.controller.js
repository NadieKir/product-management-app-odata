sap.ui.define(
  [
    "productmanagement/products/controller/BaseController",
    "productmanagement/products/controller/fragments/GroupDialog",
    "productmanagement/products/controller/fragments/SortDialog",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "productmanagement/products/model/formatter/formatter",
  ],
  function (BaseController, GroupDialog, SortDialog, JSONModel, MessageBox, MessageToast, formatter) {
    "use strict";

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

        this.oViewModel = oView.getModel("productsOverviewView");
      },

      /**
       * Products table selection change event handler.
       */
      onTableSelectionChange: function () {
        const aSelectedItems = this.byId("idProductsTable").getSelectedItems();
        const aSelectedItemsData = aSelectedItems.map((oItem) => oItem.getBindingContext().getObject());

        this.oViewModel.setProperty("/SelectedProducts", aSelectedItemsData);
      },

      /**
       * Delete product button press event handler.
       */
      onDeleteProductButtonPress: function () {
        const aProductsToDelete = this.oViewModel.getProperty("/SelectedProducts");
        const aProductsToDeleteIds = aProductsToDelete.map((oProduct) => oProduct.ID);
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
          const sMessageToastText = this.getLocalizedString(
            aProductsToDeleteIds.length === 1 ? "DeleteConfirmedText.Singular" : "DeleteConfirmedText.Plural",
            sProductsToDeleteInfo
          );

          console.log("delete product");

          MessageToast.show(sMessageToastText);
        }
      },
    });
  }
);
