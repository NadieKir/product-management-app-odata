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

      _model: new JSONModel(),

      /**
       * Create supplier(s).
       *
       * @param {(Object | Object[])} aPayload - New supplier(s) payload.
       *
       * @returns {(Object | Object[])} - New supplier(s) full data.
       */
      create: function (aPayload) {
        if (!Array.isArray(aPayload)) {
          aPayload = [aPayload];
        }

        const aSuppliers = this.getData();

        aPayload.forEach((oNewSupplierData) => {
          oNewSupplierData.Id = helper.keepLettersAndNumbers(oNewSupplierData.Name);
          aSuppliers.push(oNewSupplierData);
        });

        this.setData(aSuppliers);

        return aPayload.length > 1 ? aPayload : aPayload[0];
      },
    };
  }
);
