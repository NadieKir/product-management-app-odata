sap.ui.define(
  ["sap/ui/model/Filter", "sap/ui/model/FilterOperator", "productmanagement/products/constant/constant"],
  function (Filter, FilterOperator, constant) {
    "use strict";

    const { ADD_SUPPLIER_GROUP } = constant;

    return {
      /**
       * Supplier dialog search event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onSelectSuppliersDialogSearch: function (oEvent) {
        const sValue = oEvent.getParameter("value");
        const aSelectSuppliersDialogItemsBinding = oEvent.getSource().getBinding("items");
        const oCurrentProductSuppliersFilter = aSelectSuppliersDialogItemsBinding.aFilters[0];

        if (!sValue) {
          aSelectSuppliersDialogItemsBinding.filter(oCurrentProductSuppliersFilter);

          return;
        }

        const oQueryFilter = new Filter({
          path: "Name",
          operator: FilterOperator.Contains,
          value1: sValue,
          caseSensitive: false,
        });

        aSelectSuppliersDialogItemsBinding.filter([oCurrentProductSuppliersFilter, oQueryFilter]);
      },

      /**
       * Supplier dialog confirm event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onSelectSuppliersDialogConfirm: function (oEvent) {
        const oSuppliersTableItems = this.byId("idSuppliersTable").getBinding("items");
        const aSelectedItems = oEvent.getParameter("selectedItems");
        const aSelectedSuppliers = aSelectedItems.map((oSupplier) =>
          oSupplier.getBindingContext().getObject()
        );

        aSelectedSuppliers.forEach((oSupplier) => {
          oSuppliersTableItems.create(
            {
              Product_ID: this.sProductId,
              Supplier_ID: oSupplier.ID,
              Supplier: oSupplier,
            },
            true,
            { groupId: ADD_SUPPLIER_GROUP }
          );
        });
      },
    };
  }
);
