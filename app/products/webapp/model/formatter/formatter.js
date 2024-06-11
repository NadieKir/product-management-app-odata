sap.ui.define(
  [
    "sap/ui/core/format/DateFormat",
    "productmanagement/products/constant/constant",
    "productmanagement/products/helper/helper",
  ],
  (DateFormat, constant, helper) => {
    "use strict";

    const { AMOUNT_OF_DAYS_TO_BE_NEW, DEFAULT_PRODUCTS_SORTER } = constant;

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
       * Get formatted date.
       *
       * @param {string} sJsonDate - Date string in JSON format, for example /Date(1701388800000)/.
       * @param {string} [sFormat = yMMMd] - Date format pattern.
       *
       * @returns {string} - Formatted date.
       */
      jsonDateStringFormatter: function (sJsonDate, sFormat = "yMMMd") {
        const oDate = helper.getDateFromJsonDateString(sJsonDate);
        const oDateFormat = DateFormat.getDateTimeInstance({
          format: sFormat,
        });

        return oDate ? oDateFormat.format(oDate) : "";
      },

      /**
       * Get sort button type ("Neutral" when sorter is applied and "Default" when not).
       *
       * @param {Object} oSorter - Current sorter.
       *
       * @returns {sap.m.ButtonType} - Sort button ButtonType.
       */
      sortButtonStyleFormatter: function (oSorter) {
        if (!oSorter) return "Default";

        const { PATH, DESCENDING } = DEFAULT_PRODUCTS_SORTER;

        if (oSorter?.path === PATH && oSorter?.descending === DESCENDING) {
          return "Default";
        }

        return "Neutral";
      },
    };

    return formatter;
  }
);
