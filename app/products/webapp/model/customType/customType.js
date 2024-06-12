sap.ui.define(
  [
    "sap/ui/model/type/Date",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "productmanagement/products/model/i18nModel",
  ],
  (Date, SimpleType, ValidateException, i18nModel) => {
    "use strict";

    const ZIP_CODE_MIN_DIGITS = 3;
    const ZIP_CODE_MAX_DIGITS = 10;

    Date.extend("custom.type.RequiredDate", {
      validateValue: function (oValue) {
        Date.prototype.validateValue.call(this, oValue);

        if (!oValue) {
          const sErrorMessage = i18nModel.getLocalizedString("DatePickerValidation.Required");

          throw new ValidateException(sErrorMessage);
        }
      },
    });

    SimpleType.extend("custom.type.ZipCode", {
      formatValue: function (oValue) {
        return oValue;
      },

      parseValue: function (oValue) {
        return oValue;
      },

      validateValue: function (oValue) {
        const bValueIsInteger = Number.isInteger(+oValue);
        const nValueDigits = String(oValue).length;

        if (!bValueIsInteger || nValueDigits <= ZIP_CODE_MIN_DIGITS || nValueDigits >= ZIP_CODE_MAX_DIGITS) {
          const sErrorMessage = i18nModel.getLocalizedString("ZipCodeValidation");

          throw new ValidateException(sErrorMessage);
        }
      },
    });
  }
);
