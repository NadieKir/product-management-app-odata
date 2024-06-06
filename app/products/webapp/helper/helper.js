sap.ui.define(["productmanagement/products/constant/constant"], (constant) => {
  "use strict";

  const { ONE_DAY_IN_MS } = constant;

  const helper = {
    /**
     * Get whether arrays values are intersecting (have at least one element in common).
     *
     * @param {(number | string | boolean)[]} aArr - Values to search in.
     * @param {(number | string | boolean)[]} aTargetArr - Values to be intersected.
     *
     * @returns {string} - Whether arrays values are intersecting.
     */
    areIntersecting: function (aArr, aTargetArr) {
      return aTargetArr.some((sItem) => aArr.includes(sItem));
    },

    /**
     * Get whether array is sorted.
     *
     * @param {(number | string)[]} aArr - Array to check its sorting.
     * @param {boolean} [bDescending = false] - Whether to check sorting in descending order.
     *
     * @returns {boolean} - Whether array is sorted.
     */
    isSorted: function (aArr, bDescending = false) {
      const bCompareAsNumbers = typeof aArr[0] === "number";

      if (bCompareAsNumbers) {
        return bDescending
          ? aArr.every((nItem, nIndex) => nItem <= (aArr[nIndex - 1] || nItem))
          : aArr.every((nItem, nIndex) => nItem >= (aArr[nIndex - 1] || nItem));
      }

      return bDescending
        ? aArr.every((sItem, nIndex) => {
            return sItem.localeCompare(aArr[nIndex + 1] || sItem) >= 0;
          })
        : aArr.every((sItem, nIndex) => {
            return sItem.localeCompare(aArr[nIndex + 1] || sItem) <= 0;
          });
    },

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
     * Remove chars that are not letters or numbers from string.
     *
     * @param {string} sString - String for keeping letters and numbers.
     *
     * @returns {string} - sString without chars that are not letters or numbers.
     */
    keepLettersAndNumbers: function (sString) {
      if (typeof sString !== "string") return "";

      return sString.replace(/[^a-zA-Z0-9]+/g, "");
    },

    /**
     * Get timestamp string.
     *
     * @returns {string} - Timestamp string.
     */
    getTimestampString: function () {
      const oCurrentDate = new Date();

      return oCurrentDate.getTime().toString();
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
