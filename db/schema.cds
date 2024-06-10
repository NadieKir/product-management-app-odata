namespace product_management;

using {
        managed,
        cuid,
        User,
        sap.common.CodeList
} from '@sap/cds/common';

entity Categories : cuid {
        Name : String;
}

entity Suppliers : cuid {
        Name    : String;
        Country : String;
        State   : String;
        City    : String;
        Street  : String;
        ZipCode : Integer;
}

entity Comments : cuid {
        Product : Association to Products;
        Text    : String;
        Author  : String;
        Date    : String;
}

entity ProductsCategories : cuid {
        Product  : Association to Products;
        Category : Association to Categories;
}

entity ProductsSuppliers : cuid {
        Product  : Association to Products;
        Supplier : Association to Suppliers;
}

entity Products : cuid  {
        Name         : String;
        Description  : String;
        Rating       : Integer;
        ReleaseDate  : String;
        DiscountDate : String;
        Price        : Decimal;
        Image        : String;
        MainCategory : Association to Categories;
        Categories   : Association to many ProductsCategories
                               on Categories.Product = $self;
        Suppliers    : Association to many ProductsSuppliers
                               on Suppliers.Product = $self;
        Comments     : Association to many Comments
                               on Comments.Product = $self;
}
