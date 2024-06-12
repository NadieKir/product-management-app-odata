sap.ui.define(
  ["productmanagement/products/constant/constant", "productmanagement/products/helper/helper"],
  (constant, helper) => {
    "use strict";

    const { DEFAULT_PRODUCTS_SORTER } = constant;

    const formatter = {
      /**
       * Get amount of selected rows to display in button in round brackets.
       *
       * @param {Object[]} aSelectedProducts - Selected products.
       *
       * @returns {string} - Amount of selected rows to display in button in round brackets.
       */
      deleteProductsButtonTextFormatter: function (aSelectedProducts) {
        const aSelectedProductsLength = aSelectedProducts?.length || 0;

        return aSelectedProductsLength > 0 ? `(${aSelectedProducts.length})` : "";
      },

      /**
       * Get sort button type ("Neutral" when sorter is applied and "Default" when not).
       *
       * @param {Object} oSorter - Current sorter.
       *
       * @returns {sap.m.ButtonType} - Sort button ButtonType.
       */
      sortButtonStyleFormatter: function (oSorter) {
        const { PATH, DESCENDING } = DEFAULT_PRODUCTS_SORTER;

        if (oSorter?.sPath === PATH && oSorter?.bDescending === DESCENDING) {
          return "Default";
        }

        return "Neutral";
      },
    };

    return formatter;
  }
);
