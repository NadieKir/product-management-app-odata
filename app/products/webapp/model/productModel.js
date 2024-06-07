sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "productmanagement/products/model/baseModel",
    "productmanagement/products/helper/helper",
  ],
  function (JSONModel, baseModel, helper) {
    "use strict";

    return {
      ...baseModel,

      // _model: new JSONModel(),

      /**
       * Create product(s).
       *
       * @param {(Object | Object[])} aPayload - New product(s) payload.
       *
       * @returns {(Object | Object[])} - New product(s) full data.
       */
      create: function (aPayload) {
        let bIsPayloadArray = true;

        if (!Array.isArray(aPayload)) {
          bIsPayloadArray = false;
          aPayload = [aPayload];
        }

        const aProducts = this.getData();

        aPayload.forEach((oNewProductData) => {
          oNewProductData.ID = helper.getTimestampString();

          aProducts.push(oNewProductData);
        });

        this.setData(aProducts);

        return bIsPayloadArray ? aPayload : aPayload[0];
      },

      /**
       * Update product.
       *
       * @param {string} sId - Id of product to update.
       * @param {Object} oData - Data that should be updated.
       */
      update: function (sId, oData) {
        const aProducts = this.getData();
        const nProductIndex = aProducts.findIndex((oProduct) => oProduct.ID === sId);
        const oProduct = aProducts[nProductIndex];

        for (let sProperty in oData) {
          oProduct[sProperty] = oData[sProperty];
        }

        const aUpdatedProducts = aProducts.toSpliced(nProductIndex, 1, oProduct);

        this.setData(aUpdatedProducts);
      },

      /**
       * Delete products.
       *
       * @param {string[]} aIds - Products to delete ids.
       */
      delete: function (aIds) {
        const aRemainingProductsData = this.getData().filter((oProduct) => !aIds.includes(oProduct.Id));

        this.setData(aRemainingProductsData);
      },
    };
  }
);
