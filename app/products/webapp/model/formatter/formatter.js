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

        if (!oSorter || (oSorter?.sPath === PATH && oSorter?.bDescending === DESCENDING)) {
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
       * Get product subcategories or subcategories properties.
       *
       * @param {Array} aSubcategoriesPaths - Array of subcategories paths.
       * @param {string} sProperty - Subcategory property to get.
       *
       * @returns {Array} - Product subcategories or subcategories properties.
       */
      getSubcategoriesFormatter: function (aSubcategoriesPaths, sProperty) {
        aSubcategoriesPaths = aSubcategoriesPaths?.__list || aSubcategoriesPaths;

        if (!Array.isArray(aSubcategoriesPaths)) return [];

        const aSubcategories = aSubcategoriesPaths.map((sPath) => {
          sPath = sProperty ? `/${sPath}/Subcategory/${sProperty}` : `/${sPath}/Subcategory`;

          return this.getModel().getProperty(sPath);
        });

        return aSubcategories;
      },

      /**
       * Get concatenated product subcategories properties.
       *
       * @param {Array} aSubcategoriesPaths - Array of subcategories paths.
       * @param {string} sProperty - Subcategory property to get.
       *
       * @returns {string} - Concatenated product subcategories properties.
       */
      getJoinedSubcategoriesFormatter: function (aSubcategoriesPaths, sProperty) {
        const aSubcategories = formatter.getSubcategoriesFormatter.call(this, aSubcategoriesPaths, sProperty);

        return aSubcategories.join(", ");
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
    };

    return formatter;
  }
);
