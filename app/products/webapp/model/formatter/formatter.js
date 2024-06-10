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

        return aSelectedProductsLength > 0 ? "(" + aSelectedProducts.length + ")" : "";
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

      /**
       * Get concatenated array values.
       *
       * @param {Array} aArray - Array to concatenate.
       * @param {string} [sProperty] - Values of which property should be concatenated if array values are objects.
       *
       * @returns {string} - Concatenated array values.
       */
      joinFormatter: function (aArray, sProperty) {
        if (!Array.isArray(aArray)) return "";

        return aArray.map((uItem) => uItem[sProperty] || uItem).join(", ");
      },

      /**
       * Get message popover button type.
       *
       * @param {sap.ui.core.message.Message[]} aMessages - Messages.
       *
       * @returns {sap.m.ButtonType} - Message popover button type.
       */
      messagePopoverButtonTypeFormatter: function (aMessages) {
        const sHighestMessageSeverity = helper.getHighestMessageSeverity(aMessages);

        switch (sHighestMessageSeverity) {
          case "Error":
            return "Negative";
          case "Warning":
            return "Critical";
          case "Success":
            return "Success";
          default:
            return "Neutral";
        }
      },

      /**
       * Get amount of highest severity messages.
       *
       * @param {sap.ui.core.message.Message[]} aMessages - Messages.
       *
       * @returns {number} - Amount of highest severity messages.
       */
      highestSeverityMessagesAmountFormatter: function (aMessages) {
        const sHighestMessageSeverity = helper.getHighestMessageSeverity(aMessages);

        const aHighestSeverityMessages = aMessages.filter(
          (oMessageItem) => oMessageItem.type === sHighestMessageSeverity
        );

        return aHighestSeverityMessages.length;
      },

      /**
       * Get message popover button icon.
       *
       * @param {sap.ui.core.message.Message[]} aMessages - Messages.
       *
       * @returns {sap.ui.core.URI} - Message popover button icon.
       */
      messagePopoverButtonIconFormatter: function (aMessages) {
        const sHighestMessageSeverity = helper.getHighestMessageSeverity(aMessages);

        switch (sHighestMessageSeverity) {
          case "Error":
            return "sap-icon://error";
          case "Warning":
            return "sap-icon://alert";
          case "Success":
            return "sap-icon://sys-enter-2";
          default:
            return "sap-icon://information";
        }
      },

      /**
       * Get message popover group name.
       *
       * @param {string[]} aControlsIds - Ids of controls to get group name.
       *
       * @returns {string} - Message popover group name.
       */
      messagePopoverGroupNameFormatter: function (aControlsIds) {
        const oControl = sap.ui.getCore().byId(aControlsIds[0]);
        const oRelatedSection = helper.findClosestParent(sap.uxap.ObjectPageSection, oControl);

        return oRelatedSection?.getProperty("title") || "";
      },

      /**
       * Get whether supplier is not in existing or pending product's suppliers.
       *
       * @param {string} sSupplierId - Supplier id.
       * @param {Object[]} aProductSuppliers - Product suppliers.
       * @param {Object[]} aSuppliersToAdd - Suppliers waiting to be added to product.
       * @param {Object[]} aSuppliersToRemove - Suppliers waiting to be removed from product.
       *
       * @returns {boolean} - Whether supplier is not in existing or pending product's suppliers.
       */
      isSupplierNonexistentFormatter: function (
        sSupplierId,
        aProductSuppliers = [],
        aSuppliersToAdd,
        aSuppliersToRemove = []
      ) {
        const aExistingSuppliers = aProductSuppliers
          .filter((oProduct) => !aSuppliersToRemove.includes(oProduct.ID))
          .concat(aSuppliersToAdd);
        const aExistingSuppliersIds = aExistingSuppliers.map((oSupplier) => oSupplier?.ID);

        return !aExistingSuppliersIds.includes(sSupplierId);
      },
    };

    return formatter;
  }
);
