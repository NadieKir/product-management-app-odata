sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "productmanagement/products/constant/constant",
    "productmanagement/products/model/i18nModel",
    "productmanagement/products/helper/helper",
  ],
  function (Controller, constant, i18nModel, helper) {
    "use strict";

    const { findClosestParent } = helper;

    return Controller.extend("productmanagement.products.controller.BaseController", {
      settingsDialogs: {},

      /**
       * Get instance of a router.
       *
       * @returns {sap.ui.core.routing.Router} - Router instance.
       */
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      /**
       * Get model.
       *
       * @returns {sap.ui.model.Model} - Model.
       */
      getModel: function (sModelName) {
        return this.getView().getModel(sModelName);
      },

      /**
       * Get localized string by key.
       *
       * @callback i18nModel.getLocalizedString
       */
      getLocalizedString: i18nModel.getLocalizedString,

      /**
       * Get fragment instance.
       *
       * @async
       *
       * @param {string} sDialogFragmentName - Path to fragment.
       *
       * @returns {sap.ui.core.Control} - Fragment instance.
       */
      getDialog: async function (sDialogFragmentName) {
        let oDialog = this.settingsDialogs[sDialogFragmentName];

        if (!oDialog) {
          this.settingsDialogs[sDialogFragmentName] = await this.loadFragment({
            name: sDialogFragmentName,
          });

          this.setDefaultDialogState(sDialogFragmentName);
        }

        return this.settingsDialogs[sDialogFragmentName];
      },

      /**
       * Set default state of fragment.
       *
       * @param {string} sDialogFragmentName - Path to fragment.
       */
      setDefaultDialogState: function (sDialogFragmentName) {
        const { DEFAULT_PRODUCTS_SORTER, SORT_DIALOG_NAME, GROUP_DIALOG_NAME } = constant;

        switch (sDialogFragmentName) {
          case SORT_DIALOG_NAME:
            this.settingsDialogs[sDialogFragmentName]?.setSelectedSortItem(DEFAULT_PRODUCTS_SORTER.PATH);
            this.settingsDialogs[sDialogFragmentName]?.setSortDescending(DEFAULT_PRODUCTS_SORTER.DESCENDING);

            break;
          case GROUP_DIALOG_NAME:
            this.settingsDialogs[sDialogFragmentName]?.setSelectedGroupItem(undefined);
            this.settingsDialogs[sDialogFragmentName]?.setGroupDescending(false);

            break;
        }
      },

      /**
       * Close dialog.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      closeDialog: function (oEvent) {
        const oSourceButton = oEvent.getSource();
        const oRelatedDialog = findClosestParent(sap.m.Dialog, oSourceButton);

        oRelatedDialog.close();
      },

      /**
       * Validates MultiComboBox value not to be empty.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       *
       * @returns {boolean} - Whether MultiComboBox is valid.
       */
      validateRequiredMultiComboBox: function (oEvent) {
        const oMultiComboBox = oEvent.getSource();
        const aSelectedKeys = oMultiComboBox.getSelectedKeys();

        if (aSelectedKeys.length) {
          oMultiComboBox.fireValidationSuccess({
            element: oMultiComboBox,
            property: "selectedKeys",
          });

          return true;
        }

        oMultiComboBox.fireValidationError({
          element: oMultiComboBox,
          property: "selectedKeys",
          message: this.getLocalizedString("MultiComboBoxValidation.Required"),
        });

        return false;
      },

      /**
       * Validate required fields to be filled.
       *
       * @param {sap.ui.core.Control[]} aControls - Controls to check.
       *
       * @returns {boolean} - Whether all required fields are filled.
       */
      validateRequiredFieldsToBeFilled: function (aControls) {
        const aRequiredControls = aControls.filter((oControl) => {
          try {
            return oControl.getProperty("required");
          } catch {
            return false;
          }
        });

        let bAreFieldsFilled = true;

        aRequiredControls.forEach((oControl) => {
          if (this.getFieldValue(oControl) === null) {
            oControl.fireValidationError({
              element: oControl,
              property: this.getFieldValueProperty(oControl),
              message: this.getLocalizedString("InputValidation.Required"),
            });

            bAreFieldsFilled = false;
          }
        });

        return bAreFieldsFilled;
      },

      validateFieldsByFieldGroupId: function (sGroupId) {
        const aFields = this.getView()
          .getControlsByFieldGroupId(sGroupId)
          .filter((oControl) => oControl instanceof sap.m.InputBase);

        const bAreRequiredFieldsFilled = this.validateRequiredFieldsToBeFilled(aFields); // later I'll combine this method functionality with validateFieldsByFieldGroupId method

        if (!bAreRequiredFieldsFilled) return false;

        let bAreFieldsValuesValid = true;

        // Found this implementation but works as sh*t,
        // Can't write something that works fine there((

        // aFields.forEach((oControl) => {
        //   const oBinding = oControl.getBinding(this.getFieldValueProperty(oControl));

        //   try {
        //     console.log(oBinding.getValue()); // old value of last input is there

        //     oBinding.getType().validateValue(oBinding.getValue());
        //   } catch (oException) {
        //     console.log(oControl);

        //     bAreFieldsValuesValid = false;
        //   }
        // });

        return bAreFieldsValuesValid;
      },

      /**
       * Get whether field group is valid.
       *
       * @param {string} sFieldGroupId - fieldGroupId property.
       * @param {Object} [oParentControl = this.getView()] - Control to search inputs in.
       *
       * @returns {boolean} - Whether field group is valid.
       */
      isFieldGroupValid: function (sFieldGroupId, oParentControl = this.getView()) {
        const aInputControls = this.getInputsByFieldGroupId(sFieldGroupId, oParentControl);

        return aInputControls.every((oControl) => oControl.getValueState() !== "Error");
      },

      /**
       * Get input based controls by field group id.
       *
       * @param {string} sFieldGroupId - fieldGroupId property.
       * @param {Object} [oParentControl = this.getView()] - Control to search inputs in.
       *
       * @returns {Object[]} - Input based controls with field group id sFieldGroupId.
       */
      getInputsByFieldGroupId: function (sFieldGroupId, oParentControl = this.getView()) {
        const aAllFieldGroupControls = oParentControl.getControlsByFieldGroupId(sFieldGroupId);

        return aAllFieldGroupControls.filter((oControl) =>
          sap.ui.base.Object.isObjectA(oControl, "sap.m.InputBase")
        );
      },

      /**
       * Get field value.
       *
       * @param {sap.ui.core.Control} oField - Field control.
       *
       * @returns {*} - Field value.
       */
      getFieldValue: function (oField) {
        const sFilterFieldControlName = oField.getMetadata().getName();

        switch (sFilterFieldControlName) {
          case "sap.m.Select":
            const aSelectValue = oField.getSelectedKey();

            return aSelectValue ? aSelectValue : null;

          case "sap.m.MultiComboBox":
            const aMultiComboBoxValue = oField.getSelectedKeys();

            return aMultiComboBoxValue.length > 0 ? aMultiComboBoxValue : null;

          case "sap.m.MultiInput":
            const aMultiInputValue = oField.getTokens().map((item) => item.getProperty("key"));

            return aMultiInputValue.length > 0 ? aMultiInputValue : null;

          case "sap.m.DateRangeSelection":
            const sDateRangeSelectionStartValue = oField.getDateValue();
            const sDateRangeSelectionEndValue = oField.getSecondDateValue();

            return sDateRangeSelectionStartValue === null
              ? null
              : { startDate: sDateRangeSelectionStartValue, endDate: sDateRangeSelectionEndValue };

          default:
            return oField.getValue() || null;
        }
      },

      /**
       * Get field property that contains its value.
       *
       * @param {sap.ui.core.Control} oField - Field control.
       *
       * @returns {string} - Value property.
       */
      getFieldValueProperty: function (oField) {
        const sFilterFieldControlName = oField.getMetadata().getName();

        switch (sFilterFieldControlName) {
          case "sap.m.MultiComboBox":
            return "selectedKeys";

          case "sap.m.MultiInput":
            return "tokens";

          case "sap.m.DateRangeSelection":
            return "dateValue";

          default:
            return "value";
        }
      },

      /**
       * Remove dialog from parent's dependents aggregation.
       *
       * @param {sap.ui.core.Fragment} oDialog - Dialog to remove from dependents.
       */
      removeDependentDialog: function (oDialog) {
        const oDialogParent = oDialog.getParent();

        oDialogParent.removeDependent(oDialog);
      },
    });
  }
);
