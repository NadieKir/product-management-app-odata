sap.ui.define(["sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Filter, FilterOperator) {
  "use strict";

  return {
    /**
     * Supplier dialog search event handler.
     *
     * @param {sap.ui.base.Event} oEvent - Event object.
     */
    onSuppliersDialogSearch: function (oEvent) {
      const oSource = oEvent.getSource();
      const sValue = oEvent.getParameter("value");

      const aSuppliersDialogItemsBinding = oSource.getBinding("items");
      const aSuppliersDialogItems = oSource.getItems();

      if (!sValue) {
        aSuppliersDialogItemsBinding.filter();

        return;
      }

      const oQueryFilter = new Filter("Name", FilterOperator.Contains, sValue);
      const oVisibilityFilter = new Filter({
        path: "Id",
        test: function (oValue) {
          const oRelatedControl = aSuppliersDialogItems.find(
            (oItem) => oItem.getBindingContext("suppliers").getObject().Id === oValue
          );

          return oRelatedControl?.getProperty("visible");
        },
      });

      aSuppliersDialogItemsBinding.filter([oQueryFilter, oVisibilityFilter]);
    },

    /**
     * Supplier dialog confirm event handler.
     *
     * @param {sap.ui.base.Event} oEvent - Event object.
     */
    onSuppliersDialogConfirm: function (oEvent) {
      const oSourceDialog = oEvent.getSource();
      const oRelatedSupplierListItem = oSourceDialog.getParent();

      const oEditableProductModel = this.getModel("editableProduct");
      const sSupplierToAddPath = oRelatedSupplierListItem.getBindingContext("editableProduct").getPath();
      const oSelectedSupplier = oEvent
        .getParameter("selectedItem")
        .getBindingContext("suppliers")
        .getObject();

      oEditableProductModel.setProperty(sSupplierToAddPath, oSelectedSupplier);

      const aInputsToSetReadOnly = this.getInputsByFieldGroupId("ProductDataField", oRelatedSupplierListItem);

      aInputsToSetReadOnly.forEach((oField) => oField.setEditable(false));

      this.removeDependentDialog(oSourceDialog);
    },

    /**
     * Supplier dialog close event handler.
     *
     * @param {sap.ui.base.Event} oEvent - Event object.
     */
    onSuppliersDialogClose: function (oEvent) {
      const oSourceDialog = oEvent.getSource();

      this.removeDependentDialog(oSourceDialog);
    },
  };
});
