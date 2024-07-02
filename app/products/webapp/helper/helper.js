sap.ui.define(["productmanagement/products/constant/constant"], (constant) => {
  "use strict";

  const { ONE_DAY_IN_MS } = constant;

  const helper = {
    /**
     * Get date object from JSON date string.
     *
     * @param {string} sJsonDate - Date string in JSON format, for example /Date(1701388800000)/.
     *
     * @returns {Date} - Date object.
     */
    getDateFromJsonDateString: function (sJsonDate) {
      if (typeof sJsonDate !== "string") return;

      const nTimestamp = sJsonDate.replace(/[^0-9]+/g, "");

      return nTimestamp.length ? new Date(+nTimestamp) : undefined;
    },

    /**
     * Get JSON date string from date instance.
     *
     * @param {(Date | string | number)} uDate - Date instance.
     *
     * @returns {string} - Date string in JSON format, for example /Date(1701388800000)/.
     */
    getJsonDateStringFromDate: function (uDate) {
      const oDate = new Date(uDate);

      if (isNaN(oDate)) return;

      return `\/Date(${oDate.getTime()})\/`;
    },

    /**
     * Get amount of days between 2 dates.
     *
     * @param {(string | Date)} sStartDate - Start date.
     * @param {(string | Date)} [sEndDate = new Date()] - End date.
     *
     * @returns {number} - Amount of days between sStartDate and sEndDate.
     */
    getAmountOfDaysBetweenDates: function (sStartDate, sEndDate = new Date()) {
      const oStartDate = helper.getDateFromJsonDateString(sStartDate) || sStartDate,
        oEndDate = helper.getDateFromJsonDateString(sEndDate) || sEndDate;

      if (!(oStartDate instanceof Date) || !(oEndDate instanceof Date)) return;

      const nDatesDifference = oEndDate.getTime() - oStartDate.getTime();

      return Math.floor(nDatesDifference / ONE_DAY_IN_MS);
    },

    /**
     * Get closest parent which is oTarget instance.
     *
     * @param {sap.ui.core.Control} oTarget - Type of parent control to find.
     * @param {sap.ui.core.Control} oSource - Child of parent to find.
     *
     * @returns {(sap.ui.core.Control | null)} - Amount of days between sStartDate and sEndDate.
     */
    findClosestParent: function (oTarget, oSource) {
      while (oSource) {
        if (oSource instanceof oTarget) {
          return oSource;
        }

        oSource = oSource.getParent();
      }

      return null;
    },

    /**
     * Get highest message severity.
     *
     * @param {sap.ui.core.message.Message[]} aMessages - Messages.
     *
     * @returns {sap.ui.core.message.MessageType} - Message severity.
     */
    getHighestMessageSeverity: function (aMessages) {
      if (aMessages.some((oMessage) => oMessage.type === "Error")) {
        return "Error";
      }

      if (aMessages.some((oMessage) => oMessage.type === "Warning")) {
        return "Warning";
      }

      if (aMessages.some((oMessage) => oMessage.type === "Success")) {
        return "Success";
      }

      return "Information";
    },
  };

  return helper;
});
