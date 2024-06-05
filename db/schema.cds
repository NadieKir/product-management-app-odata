
namespace product_management;

using {
        managed,
        cuid,
        User,
        sap.common.CodeList
} from '@sap/cds/common';

entity Categories : cuid {
        name : String;
}

entity Suppliers : cuid {
        name : String;
        country : String;
        state : String;
        city : String;
        street : String;
        zipCode : Integer;
}

entity Comments : cuid {
        product : Association to Products;
        text : String;
        author : String;
        date : String;
}

entity ProductsCategories : cuid {
        product : Association to Products;
        category : Association to Categories;
}

entity ProductsSuppliers : cuid {
        product : Association to Products;
        supplier : Association to Suppliers;
}

entity Products : cuid {
        name : String;
        description : String;
        rating : Integer;
        releaseDate : String;
        discountDate : String;
        price : Decimal;
        image : String;
        categories : Association to many ProductsCategories on categories.product = $self;
        suppliers : Association to many ProductsSuppliers on suppliers.product = $self;
        comments : Association to many Comments on comments.product = $self;
}

// entity Risks : cuid, managed {
//         title                    : String(100);
//         owner                    : String;
//         prio                     : Association to Priority;
//         descr                    : String;
//         miti                     : Association to Mitigations;
//         impact                   : Integer;
//         // bp : Association to BusinessPartners;
//         virtual criticality      : Integer;
//         virtual PrioCriticality : Integer;
// }

// entity Mitigations : cuid, managed {
//         descr    : String;
//         owner    : String;
//         timeline : String;
//         risks    : Association to many Risks
//                            on risks.miti = $self;
// }

// entity Priority : CodeList {
//         key code : String enum {
//                     high   = 'H';
//                     medium = 'M';
//                     low    = 'L';
//             };
// }