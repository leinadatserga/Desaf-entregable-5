import { Router } from 'express';
import cartModel from '../models/carts.models.js';


const routerCart = Router ();
routerCart.get ( "/", async ( req, res ) => {
    try {
        const carts = await cartModel.find ();
        res.status ( 200 ).send ({ result: "Ok", carts: carts })
    } catch ( error ) {
        res.status ( 400 ).send ({ error: `Error getting carts: ${ error }`})
    }
});
routerCart.get ( "/:id", async ( req, res ) => {
    const { id } = req.params;
    try {
        const cart = await cartModel.findById ( id );
        cart ? res.status ( 200 ).send ({ result: "Ok", cart: cart }) : res.status ( 404 ).send ({ result: "Not found" })
    } catch ( error ) {
        res.status ( 400 ).send ({ error: `Error getting cart: ${ error }`})
    }
});
routerCart.post ( "/createCart", async ( req, res ) => {
    try {
        await cartModel.create ({});
        res.status ( 200 ).send ({ result: "Ok", cart: "Cart created successfully" })
    } catch ( error ) {
        res.status ( 400 ).send ({ error: `Error creating cart: ${ error }` })
    }
});
routerCart.post ( "/:cid/products/:pid", async ( req, res ) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    try {
        const cartFind = await cartModel.findById ( cid );
        if ( cartFind ) {
            cartFind.products.push ({ id_prod: pid, quantity: quantity });
            const newCart = await cartModel.findByIdAndUpdate ( cid, cartFind );
            res.status ( 200 ).send ({ result: "Ok", cart: newCart })
        }
    } catch ( error ) {
        res.status ( 400 ).send ({ error: `Error creating cart: ${ error }` })
    }
});
routerCart.delete ( "/:id", async ( req, res ) => {
    const { id } = req.params;
    try {
        const deletedCart = await cartModel.findByIdAndDelete ( id );
        deletedCart ? res.status ( 200 ).send ({ result: "Ok", cart: deletedCart }) : res.status ( 404 ).send ({ result: "Not found" })
    } catch ( error ) {
        res.status ( 400 ).send ({ error: `Error deleting cart: ${ error }` })
    }
});
export default routerCart;