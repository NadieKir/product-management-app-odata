/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "productmanagement/products/model/models",
        "productmanagement/products/model/i18nModel",
        "productmanagement/products/model/customType/customType",
    ],
    function (UIComponent, Device, models, i18nModel) {
        "use strict";

        return UIComponent.extend("productmanagement.products.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                i18nModel.setModel(this.getModel("i18n"));
            }
        });
    }
);