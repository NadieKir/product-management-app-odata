sap.ui.define(["sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Filter, FilterOperator) {
  "use strict";

  return {
    /**
     * Supplier dialog search event handler.
     *
     * @param {sap.ui.base.Event} oEvent - Event object.
     */
    onSuppliersDialogSearch: function (oEvent) {
      const sValue = oEvent.getParameter("value");
      const aSuppliersDialogItemsBinding = oEvent.getSource().getBinding("items");
      const oCurrentProductSuppliersFilter = aSuppliersDialogItemsBinding.aFilters[0];

      if (!sValue) {
        aSuppliersDialogItemsBinding.filter(oCurrentProductSuppliersFilter);

        return;
      }

      const oQueryFilter = new Filter("Name", FilterOperator.Contains, sValue);

      aSuppliersDialogItemsBinding.filter([oCurrentProductSuppliersFilter, oQueryFilter]);
    },

    /**
     * Supplier dialog confirm event handler.
     *
     * @param {sap.ui.base.Event} oEvent - Event object.
     */
    onSuppliersDialogConfirm: function (oEvent) {
      const oSelectedSupplier = oEvent.getParameter("selectedItem").getBindingContext().getObject();
      const oSuppliersTableItems = this.byId("idSuppliersTable").getBinding("items");

      oSuppliersTableItems.create(
        {
          Product_ID: this.sProductId,
          Supplier_ID: oSelectedSupplier.ID,
          Supplier: oSelectedSupplier,
        },
        true
      );
    },
  };
});
