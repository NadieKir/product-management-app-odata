sap.ui.define(["sap/base/strings/formatMessage", "sap/ui/model/Sorter"], function (formatMessage, Sorter) {
  "use strict";

  return {
    /**
     * Products group dialog confirm event handler.
     *
     * @param {sap.ui.base.Event} oEvent - Event object.
     */
    onGroupDialogConfirm: function (oEvent) {
      const mParams = oEvent.getParameters();

      if (!mParams.groupItem) {
        this.removeProductsTableGrouping();

        return;
      }

      const sPath = mParams.groupItem.getKey();
      const bDescending = mParams.groupDescending;
      const fGroupFunction = this.getGroupingFunction(sPath);

      this.setProductsTableGrouping(sPath, bDescending, fGroupFunction);
    },

    /**
     * Remove products table grouping.
     */
    removeProductsTableGrouping: function () {
      const oProductTableBinding = this.byId("idProductsTable").getBinding("items");
      const oSorter = this.oViewModel.getProperty("/sorter");

      oProductTableBinding.sort(oSorter);

      this.oViewModel.setProperty("/grouping", null);
    },

    /**
     * Callback for a grouping function to be passed to sorter.
     *
     * @callback groupingFunction
     *
     * @param {sap.ui.model.Context} oContext - Execution context.
     *
     * @returns {{key: string, text: string}} - Settings for grouping.
     */
    /**
     * Get grouping function to be passed to sorter.
     *
     * @param {string} sPath - Property path to group by.
     *
     * @returns {groupingFunction} - Callback for a grouping function to be passed to sorter.
     */
    getGroupingFunction: function (sPath) {
      switch (sPath) {
        case "Price":
          return this.getPriceGroupingParams.bind(this);

        case "Rating":
          return this.getRatingGroupingParams.bind(this);

        case "DiscountDate":
          return this.getDiscountDateGroupingParams.bind(this);

        default:
          throw new Error(`Can't create group function for product property '${sPath}'`);
      }
    },

    /**
     * Set products table grouping sorter.
     *
     * @param {string} sPath - Property path to sort by.
     * @param {boolean} bIsDescending - Whether sorting should be applied in descending order.
     * @param {groupingFunction} - Callback for a grouping function to be passed to sorter.
     */
    setProductsTableGrouping: function (sPath, bIsDescending, fGroupingFunction) {
      const oTableBinding = this.byId("idProductsTable").getBinding("items");
      const oSorter = this.oViewModel.getProperty("/sorter") || null;
      const oGrouping = new Sorter(sPath, bIsDescending, fGroupingFunction);

      oTableBinding.sort(oSorter ? [oGrouping, oSorter] : oGrouping);

      this.oViewModel.setProperty("/grouping", oGrouping);
    },

    /**
     * Get parameters for a price grouping function.
     *
     * @param {sap.ui.model.Context} oContext - Execution context.
     *
     * @returns {{key: string, text: string}} - Settings for grouping.
     */
    getPriceGroupingParams: function (oContext) {
      const price = oContext.getProperty("Price");
      const sCurrencyCode = "USD";

      let sKey, sText;

      if (price <= 100) {
        sKey = "LessThan100";
        sText = this.getLocalizedString("AndLess", formatMessage("100 {0}", [sCurrencyCode]));
      } else if (price <= 1000) {
        sKey = "Between100And1000";
        sText = this.getLocalizedString("Between", "100", formatMessage("1000 {0}", [sCurrencyCode]));
      } else {
        sKey = "MoreThan1000";
        sText = this.getLocalizedString("AndLess", formatMessage("1000 {0}", [sCurrencyCode]));
      }

      return {
        key: sKey,
        text: formatMessage("{0} : {1}", [this.getLocalizedString("Price"), sText]),
      };
    },

    /**
     * Get parameters for a rating grouping function.
     *
     * @param {sap.ui.model.Context} oContext - Execution context.
     *
     * @returns {{key: string, text: string}} - Settings for grouping.
     */
    getRatingGroupingParams: function (oContext) {
      const nRating = oContext.getProperty("Rating");

      return {
        key: nRating,
        text: formatMessage("{0} : {1}", [this.getLocalizedString("Rating"), nRating]),
      };
    },

    /**
     * Get parameters for a discount date grouping function.
     *
     * @param {sap.ui.model.Context} oContext - Execution context.
     *
     * @returns {{key: string, text: string}} - Settings for grouping.
     */
    getDiscountDateGroupingParams: function (oContext) {
      const dDiscountDate = oContext.getProperty("DiscountDate");

      return {
        key: dDiscountDate ? "WithDiscount" : "WithoutDiscount",
        text: dDiscountDate
          ? this.getLocalizedString("Discount.With")
          : this.getLocalizedString("Discount.Without"),
      };
    },
  };
});
