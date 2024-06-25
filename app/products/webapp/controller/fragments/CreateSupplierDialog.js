sap.ui.define(
  [
    "productmanagement/products/api/countriesService",
    "productmanagement/products/model/countriesModel",
    "productmanagement/products/constant/constant",
  ],
  function (countriesService, countriesModel, constant) {
    "use strict";

    const { CREATE_SUPPLIER_GROUP } = constant;

    return {
      /**
       * Create supplier dialog before open event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onBeforeCreateSupplierDialogOpen: function (oEvent) {
        const oDialog = oEvent.getSource();
        const oDataModel = this.getModel();

        const onCreateSupplierEntrySuccess = (oData) => {
          this.oNewSupplier = oData;
        };

        const oEntry = oDataModel.createEntry("/Suppliers", {
          properties: {
            Name: "",
            Country: "",
            State: "",
            City: "",
            Street: "",
            ZipCode: "",
          },
          groupId: CREATE_SUPPLIER_GROUP,
          success: (oData) => onCreateSupplierEntrySuccess(oData),
        });

        oDialog.setBindingContext(oEntry);

        this.setCountriesModel();
      },

      /**
       * Initialize countries model.
       *
       * @async
       */
      setCountriesModel: async function () {
        const oCountriesModel = await countriesModel.getModel();

        this.getView().setModel(oCountriesModel, "countries");
      },

      /**
       * SupplierDataField field group validateFieldGroup event handler.
       */
      onSupplierDataFieldGroupValidate: function () {
        const isFieldGroupValid = this.isFieldGroupValid("SupplierDataField");

        this.oViewModel.setProperty("/IsSupplierFormValid", isFieldGroupValid);
      },

      /**
       * Create supplier button press event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onCreateSupplierDialogConfirmButtonPress: function (oEvent) {
        const aSupplierDataFields = this.getView().getControlsByFieldGroupId("SupplierDataField");
        const bAreSupplierDataRequiredFieldsFilled =
          this.validateRequiredFieldsToBeFilled(aSupplierDataFields);

        if (!bAreSupplierDataRequiredFieldsFilled) {
          this.oViewModel.setProperty("/IsSupplierFormValid", false);

          return;
        }

        const oDataModel = this.getModel();

        const onCreateSupplierSuccess = () => {
          const oSuppliersTableItems = this.byId("idSuppliersTable").getBinding("items");

          oSuppliersTableItems.create(
            {
              Product_ID: this.sProductId,
              Supplier_ID: this.oNewSupplier.ID,
              Supplier: this.oNewSupplier,
            },
            true
          );

          this.closeDialog(oEvent);
        };

        oDataModel.submitChanges({
          groupId: CREATE_SUPPLIER_GROUP,
          success: onCreateSupplierSuccess,
        });
      },

      /**
       * Create supplier dialog after close event handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onCreateSupplierDialogCancelButtonPress: function (oEvent) {
        const oDataModel = this.getModel();
        const sPathToReset = oEvent.getSource().getBindingContext().getPath();

        oDataModel.resetChanges([sPathToReset], false, true);

        this.closeDialog(oEvent);
      },

      /**
       * Supplier country input change handler.
       *
       * @param {sap.ui.base.Event} oEvent - Event object.
       */
      onSupplierCountryInputChange: function (oEvent) {
        const oCountriesModel = this.getModel("countries");
        const sCountryIso2Code = oEvent.getSource().getProperty("selectedKey");

        oCountriesModel.setProperty("/CountryIso2", sCountryIso2Code);

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
        const sCountryIso2Code = this.getModel("countries").getProperty("/CountryIso2");

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
    };
  }
);
