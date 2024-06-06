sap.ui.define(
  [
    "productmanagement/products/api/countriesService",
    "productmanagement/products/constant/constant",
    "productmanagement/products/helper/helper",
  ],
  function (countriesService, constant, helper) {
    "use strict";

    const { findClosestParent } = helper;
    const { SUPPLIERS_DIALOG_NAME } = constant;

    return {
      /**
       * Supplier country input change handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onSupplierCountryInputChange: function (oEvent) {
        const sCountryIso2Code = oEvent.getSource().getProperty("selectedKey");

        this.setCountryStates(sCountryIso2Code);
      },

      /**
       * Set country states to countries model.
       *
       * @async
       *
       * @param {string} sCountryIso2Code - ISO2 country code to get states in.
       */
      setCountryStates: async function (sCountryIso2Code) {
        const oCountriesModel = this.getModel("countries");
        const aStates = await countriesService.getCountryStates(sCountryIso2Code);

        oCountriesModel.setProperty("/States", aStates);
      },
      /**
       * Supplier state input change handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onSupplierStateInputChange: function (oEvent) {
        const oSource = oEvent.getSource();
        const sStateIso2Code = oSource.getProperty("selectedKey");
        const oSupplierCountryInput = oSource
          .getParent()
          .getCells()
          .find((oCell) => oCell.getProperty("name") === "Country");
        const sCountryIso2Code = oSupplierCountryInput.getSelectedKey();

        this.setStateCities(sCountryIso2Code, sStateIso2Code);
      },

      /**
       * Set state cities to countries model.
       *
       * @async
       *
       * @param {string} sCountryIso2Code - ISO2 country code to get cities in.
       * @param {string} sStateIso2Code - ISO2 state code to get cities in.
       */
      setStateCities: async function (sCountryIso2Code, sStateIso2Code) {
        const oCountriesModel = this.getModel("countries");
        const aCities = await countriesService.getStateCities(sCountryIso2Code, sStateIso2Code);

        oCountriesModel.setProperty("/Cities", aCities);
      },

      /**
       * Select supplier button press event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onSelectSupplierButtonPress: async function (oEvent) {
        const oSourceButton = oEvent.getSource();
        const oSourceSupplierListItem = findClosestParent(sap.m.ColumnListItem, oSourceButton);
        const oSuppliersDialog = await this.getDialog(SUPPLIERS_DIALOG_NAME);

        oSourceSupplierListItem.addDependent(oSuppliersDialog);
        oSuppliersDialog.open();
      },

      /**
       * Delete new supplier button press event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onDeleteNewSupplierButtonPress: function (oEvent) {
        const oSourceButton = oEvent.getSource();
        const oEditableProductContext = oSourceButton.getBindingContext("editableProduct");
        const oEditableProductModel = oEditableProductContext.getModel();
        const oSupplierToRemovePath = oEditableProductContext.getPath();

        oEditableProductModel.setProperty(oSupplierToRemovePath, undefined);

        const oFragmentToDestroy = findClosestParent(sap.m.ColumnListItem, oSourceButton);

        this.destroyNewSupplierListItemFragments([oFragmentToDestroy]);
        this.setProductFormValidity();
      },
    };
  }
);
