sap.ui.define(
  ["productmanagement/products/constant/constant", "productmanagement/products/helper/helper"],
  (constant, helper) => {
    "use strict";

    const { DEFAULT_PRODUCTS_SORTER, AMOUNT_OF_DAYS_TO_BE_NEW } = constant;

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

      /**
       * Get amount of days between given day and current date.
       *
       * @param {string} sJsonDate - Date string in JSON format, for example /Date(1701388800000)/.
       *
       * @returns {number} - Amount of days between sJsonDate and current date.
       */
      passedDaysFormatter: function (sJsonDate) {
        return helper.getAmountOfDaysBetweenDates(sJsonDate);
      },

      /**
       * Get whether entity can be considered as new based on its date value.
       *
       * @param {string} sJsonDate - Date string in JSON format, for example /Date(1701388800000)/.
       * @param {number} [nAmountOfDaysToBeNew = AMOUNT_OF_DAYS_TO_BE_NEW] - Date format pattern.
       *
       * @returns {boolean} - Whether entity can be considered as new.
       */
      isNewFormatter: function (sJsonDate, nAmountOfDaysToBeNew = AMOUNT_OF_DAYS_TO_BE_NEW) {
        const nAmountOfDays = helper.getAmountOfDaysBetweenDates(sJsonDate);

        if (nAmountOfDays === undefined) return false;

        return nAmountOfDays <= nAmountOfDaysToBeNew;
      },
    };

    return formatter;
  }
);
