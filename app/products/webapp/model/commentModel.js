sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "productmanagement/products/model/baseModel",
    "productmanagement/products/helper/helper",
    "productmanagement/products/model/userModel",
  ],
  function (JSONModel, baseModel, helper, userModel) {
    "use strict";

    return {
      ...baseModel,

      _model: new JSONModel(),

      /**
       * Create comment(s).
       *
       * @param {(Object | Object[])} aPayload - New comment(s) payload.
       *
       * @returns {(Object | Object[])} - New comment(s) full data.
       */
      create: function (aPayload) {
        if (!Array.isArray(aPayload)) {
          aPayload = [aPayload];
        }

        const aComments = this.getData();

        aPayload.forEach((oNewCommentData) => {
          oNewCommentData.Id = helper.getTimestampString();
          oNewCommentData.Author = userModel.getData().Name;
          oNewCommentData.Date = helper.getJsonDateStringFromDate(new Date());

          aComments.push(oNewCommentData);
        });

        this.setData(aComments);

        return aPayload.length > 1 ? aPayload : aPayload[0];
      },
    };
  }
);
