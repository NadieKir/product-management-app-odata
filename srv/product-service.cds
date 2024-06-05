
using {product_management as pm} from '../db/schema';

@path: 'service/product'
service ProductService {
    entity Products as projection on pm.Products;
    entity Comments as projection on pm.Comments;
    entity Categories as projection on pm.Categories;
    entity Suppliers as projection on pm.Suppliers;
    entity ProductsSuppliers as projection on pm.ProductsSuppliers;
    entity ProductsCategories as projection on pm.ProductsCategories;
    //annotate Products with @odata.draft.enabled;
}