import "dotenv/config"
import express, { json } from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import routerProd from './routes/products.routes.js';
import routerCart from './routes/carts.routes.js';
import routerMessages from './routes/messages.routes.js';
import mongoose from 'mongoose';
import { __dirname } from './path.js';
import path from 'path';
import prodModel from './models/products.models.js';
import messageModel from './models/messages.models.js';
import cartModel from './models/carts.models.js';

const PORT = 8080;
const app = express ();
const server = app.listen ( PORT, () => {
    console.log ( `Server port: ${ PORT }` );
});

mongoose.connect ( process.env.MONGO_URL )
.then ( async () => {
    console.log ( "DB connected" )
})
.catch (( error ) => console.log ( "Failed to connect to MongoDB Atlas: ", error ))
const io = new Server ( server );
app.use ( express.urlencoded ({ extended: true }));
app.use ( express.json ());
app.engine ( "handlebars", engine ());
app.set ( "view engine", "handlebars" );
app.set ( "views", path.resolve ( __dirname, "./views" ));
app.use ( "/static", express.static ( path.join ( __dirname, "/public" )));
app.use ( "/api/carts", routerCart);
app.use ( "/api/products", routerProd);
app.use ( "/api/messages", routerMessages);
const mailMessages = [];
let prods;
io.on ( "connection", async ( socket ) => {
    const products = JSON.stringify ( await prodModel.find ());
    prods = JSON.parse ( products );
    console.log( "Socket.io connection" );
    socket.on ( "newProduct", ( productData ) => {
        prodModel.create ( productData );
        prods = JSON.parse ( products );
    });
    socket.emit ( "reload", true );
    socket.on ( "message", mailMessageContent => {
        messageModel.create( mailMessageContent );
        mailMessages.push ( mailMessageContent );
        io.emit ( "showMessages", mailMessages )
    })
})

app.get ( "/static/realtimeproducts", async ( req, res ) => {
    const products = JSON.stringify ( await prodModel.find ());
    prods = JSON.parse ( products );
    res.render ( "realTimeProducts", {
        title: "RealTimeProducts",
        nombre: "Ingreso de nuevo Producto",
        productsList: prods,
        pathCss: "realTimeProducts",
        pathJs: "realTimeProducts"
    })
})
app.get ( "/static", async ( req, res ) => {
    const products = JSON.stringify ( await prodModel.find ());
    prods = JSON.parse ( products );
    res.render ( "home", {
        title: "Home",
        nombre: "Lista de Productos",
        productsList: prods,
        pathCss: "style",
        pathJs: "script"
    })
})
app.get ( "/static/messages", ( req, res ) => {
    res.render ( "messages", {
        nombre: "Envía tu consulta",
        pathCss: "style",
        pathJs: "messages"
    })
})
