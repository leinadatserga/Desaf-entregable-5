import { Router } from 'express';
import cartModel from '../models/carts.models.js';


const routerCart = Router ();
routerCart.get ( "/", async ( req, res ) => {
    try {
        const carts = await cartModel.find ();
        res.status ( 200 ).send ({ result: "Ok", carts: carts });
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error getting carts: ${ error }`});
    }
});
routerCart.get ( "/:cid", async ( req, res ) => {
    const { cid } = req.params;
    try {
        const cart = await cartModel.findById ( cid );
        if ( cart ) {
            const cartProdRef = await cartModel.findOne ({ _id: cid }).populate ( "products.id_prod" );
            res.status ( 200 ).send ({ result: "Ok", cart: cartProdRef });
        } else {
            res.status ( 404 ).send ({ result: "Not found" });
        }
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error getting cart: ${ error }`});
    }
});
routerCart.post ( "/", async ( req, res ) => {
    try {
        await cartModel.create ({});
        res.status ( 200 ).send ({ result: "Ok", cart: "Cart created successfully" });
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error creating cart: ${ error }` });
    }
});
routerCart.post ( "/:cid/products/:pid", async ( req, res ) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    try {
        let quant;
        const cartFind = await cartModel.findById ( cid );
        if ( !cartFind ) res.status ( 404 ).send ({ result: "Not found" });
        const indexProd = cartFind.products.findIndex ( prod => prod.id_prod == pid );
        if ( indexProd != -1 ) {
            quant = cartFind.products [ indexProd ].quantity + quantity;
            cartFind.products.splice ( indexProd, 1, { id_prod: pid, quantity: quant });
            await cartModel.findByIdAndUpdate ( cid, cartFind );
        } else {
                cartFind.products.push ({ id_prod: pid, quantity: quantity });
                await cartModel.findByIdAndUpdate ( cid, cartFind );
            }
        res.status ( 200 ).send ({ result: "Ok", cart: cartFind });
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error adding products to cart: ${ error }` });
    }
});
routerCart.put ( "/:cid/products/:pid", async ( req, res ) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    try {
        let quant;
        const cart = await cartModel.findById ( cid );
        const indexProd = cart.products.findIndex ( prod => prod.id_prod == pid );
        if ( indexProd != -1 ) {
            quant = cart.products [ indexProd ].quantity + quantity;
            cart.products.splice ( indexProd, 1, { id_prod: pid, quantity: quant });
            await cartModel.findByIdAndUpdate ( cid, cart );
            res.status ( 200 ).send ({ result: "Ok", cart: cart });
        } else {
            res.status ( 404 ).send ({ result: "Not found" });
        }
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error updating cart: ${ error }` });
    }
});
routerCart.put ( "/:cid", async ( req, res ) => {
    const { cid } = req.params;
    const prods = req.body;
    try {
        const cartFind = await cartModel.findById ( cid );
        const newCart = async ( cid, cartFind ) => await cartModel.findByIdAndUpdate ( cid, cartFind );
        prods.forEach(element => {
            let prodId = cartFind.products.findIndex ( prod => prod.id_prod == element.id_prod );
            if ( prodId != -1 ) {
                let quant = ( cartFind.products[prodId].quantity + element.quantity );
                cartFind.products[prodId].quantity = quant;
                newCart ( cid, cartFind );
            } else {
                cartFind.products.push ( element );
                newCart ( cid, cartFind );
            }
        });
        res.status ( 200 ).send ({ result: "Ok", cart: cartFind });
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error updating cart: ${ error }` });
    }
});
routerCart.delete ( "/:cid/products/:pid", async ( req, res ) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartModel.findById ( cid );
        const indexProd = cart.products.findIndex ( prod => prod.id_prod == pid );
        if ( indexProd != -1 ) {
            cart.products.splice ( indexProd, 1 );
            await cartModel.findByIdAndUpdate ( cid, cart );
            res.status ( 200 ).send ({ result: "Ok", cart: cart });
        } else {
            res.status ( 404 ).send ({ result: "Not found" });
        }
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error deleting product of cart: ${ error }` });
    }
});
routerCart.delete ( "/:cid", async ( req, res ) => {
    const { cid } = req.params;
    try {
        const deletedCart = await cartModel.findById ( cid );
        if ( deletedCart ) {
            deletedCart.products.splice ( 0 );
            await cartModel.findByIdAndUpdate ( cid, deletedCart );
            res.status ( 200 ).send ({ result: "Ok", cart: deletedCart });
        } else {
            res.status ( 404 ).send ({ result: "Not found" });
        }
    } catch ( error ) {
        res.status ( 500 ).send ({ error: `Error deleting cart: ${ error }` });
    }
});
export default routerCart;