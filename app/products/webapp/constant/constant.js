sap.ui.define([], () => {
  "use strict";

  const DEFAULT_PRODUCTS_SORTER = {
    PATH: undefined,
    DESCENDING: false,
  };

  const FRAGMENTS_PATH = "productmanagement.products.view.fragments.";
  const SORT_DIALOG_NAME = FRAGMENTS_PATH + "SortDialog";
  const GROUP_DIALOG_NAME = FRAGMENTS_PATH + "GroupDialog";
  const SUPPLIERS_DIALOG_NAME = FRAGMENTS_PATH + "SelectSuppliersDialog";
  const CREATE_SUPPLIER_DIALOG_NAME = FRAGMENTS_PATH + "CreateSupplierDialog";

  const AMOUNT_OF_DAYS_TO_BE_NEW = 7;

  const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

  const CREATE_SUPPLIER_GROUP = "CreateSupplierGroup";
  const DELETE_PRODUCTS_GROUP = "DeleteProductsGroup";

  const O_DATA_DEFERRED_GROUPS = [CREATE_SUPPLIER_GROUP, DELETE_PRODUCTS_GROUP];

  return {
    DEFAULT_PRODUCTS_SORTER,
    SORT_DIALOG_NAME,
    GROUP_DIALOG_NAME,
    SUPPLIERS_DIALOG_NAME,
    CREATE_SUPPLIER_DIALOG_NAME,
    AMOUNT_OF_DAYS_TO_BE_NEW,
    ONE_DAY_IN_MS,
    CREATE_SUPPLIER_GROUP,
    DELETE_PRODUCTS_GROUP,
    O_DATA_DEFERRED_GROUPS,
  };
});
