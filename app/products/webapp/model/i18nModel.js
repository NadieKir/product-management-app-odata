sap.ui.define([], function () {
  "use strict";

  let _model;

  return {
    /**
     * Set _model.
     *
     * @param {sap.ui.model.resource.ResourceModel} oModel - Resource model reference.
     */
    setModel: function (oModel) {
      _model = oModel;
    },

    /**
     * Get localized string by key.
     *
     * @param {string} sKey - Key of a localized string in i18n model.
     * @param {string[]} [aArgs] - Values to be used as placeholders.
     *
     * @returns {string} - Localized string.
     */
    getLocalizedString: function (sKey, ...aArgs) {
      return _model.getResourceBundle().getText(sKey, aArgs);
    },
  };
});
