sap.ui.define(["productmanagement/products/constant/constant"], function (constant) {
  "use strict";

  const { SORT_DIALOG_NAME } = constant;

  return {
    /**
     * Products sort dialog confirm event handler.
     *
     * @param {sap.ui.base.Event} oEvent - Event object.
     */
    onSortDialogConfirm: function (oEvent) {
      const oParams = oEvent.getParameters();
      const sPath = oParams.sortItem?.getKey();
      const bDescending = oParams.sortDescending;

      this.setProductsTableSorter(sPath, bDescending);
    },

    /**
     * Products sort dialog reset event handler.
     */
    onSortDialogReset: function () {
      this.setDefaultDialogState(SORT_DIALOG_NAME);
    },
  };
});
