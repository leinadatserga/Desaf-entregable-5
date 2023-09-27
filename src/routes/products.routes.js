import { Router } from 'express';
import prodModel from '../models/products.models.js';


const routerProd = Router ();
routerProd.get ( "/", async ( req, res ) => {
    const { limit, page, query, sort } = req.query;
    let queryParsed;
    query ? queryParsed = JSON.parse(query) : queryParsed = {};
    let lim = limit;
    if ( limit <= 0 || limit == undefined ) lim = 10;
    try {
        const productsSort = await prodModel.paginate ( queryParsed , { limit: lim, page: page, sort: {"price": sort } });
        const products = await prodModel.paginate ( queryParsed , { limit: lim, page: page });
        if ( sort ) {
            res.status ( 200 ).send ({ result: "Ok", prods: productsSort });  
        } else {
            res.status ( 200 ).send ({ result: "Ok", prods: products });
        }
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error when consulting products: ${ error }`});
    }
});
routerProd.get ( "/:id", async ( req, res ) => {
    const { id } = req.params;
    try {
        const product = await prodModel.findById ( id );
        product ? res.status ( 200 ).send ({ result: "Ok", prod: product }) : res.status ( 404 ).send ({ result: "Not found" });
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error getting product: ${ error }`});
    }
});
routerProd.post ( "/", async ( req, res ) => {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    try {
        const newProduct = await prodModel.create ({ title, description, code, price, status, stock, category, thumbnails });
        res.status ( 200 ).send ({ result: "Ok", prod: newProduct });
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error creating product: ${ error }` });
    }
});
routerProd.put ( "/:id", async ( req, res ) => {
    const { id } = req.params;
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    try {
        const updatedProduct = await prodModel.findByIdAndUpdate ( id, { title, description, code, price, status, stock, category, thumbnails });
        updatedProduct ? res.status ( 200 ).send ({ result: "Ok", prod: updatedProduct }) : res.status ( 404 ).send ({ result: "Not found" });
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error updating product: ${ error }` });
    }
});
routerProd.delete ( "/:id", async ( req, res ) => {
    const { id } = req.params;
    try {
        const deletedProduct = await prodModel.findByIdAndDelete ( id );
        deletedProduct ? res.status ( 200 ).send ({ result: "Ok", prod: deletedProduct }) : res.status ( 404 ).send ({ result: "Not found" });
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error deleting product: ${ error }` });
    }
});
export default routerProd;