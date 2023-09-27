import "dotenv/config"
import express, { json } from 'express';
import cookieParser from "cookie-parser";
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import routerProd from './routes/products.routes.js';
import routerCart from './routes/carts.routes.js';
import routerMessages from './routes/messages.routes.js';
import routerUsers from "./routes/users.routes.js";
import routerSession from "./routes/sessions.routes.js";
import mongoose from 'mongoose';
import { __dirname } from './path.js';
import path from 'path';
import prodModel from './models/products.models.js';
import messageModel from './models/messages.models.js';
import userModel from "./models/users.model.js";
import cartModel from './models/carts.models.js';
import session from "express-session";
import MongoStore from "connect-mongo";
import initializePassport from "./config/passport.js";
import passport from "passport";

const PORT = 8080;
const app = express ();
const server = app.listen ( PORT, () => {
    console.log ( `Server port: ${ PORT }` );
});

mongoose.connect ( process.env.MONGO_URL )
.then ( async () => {
    console.log ( "DB connected" )
})
.catch (( error ) => console.log ( "Failed to connect to MongoDB Atlas: ", error ));
const io = new Server ( server );
app.use ( express.urlencoded ({ extended: true }));
app.use ( express.json ());
app.use ( cookieParser ( process.env.COOKIE_SIGN ));
app.use ( session ({
    store: MongoStore.create ({
        mongoUrl: process.env.MONGO_URL,
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 90
    }),
    secret: process.env.PRIVATE_SESSION,
    resave: true,
    saveUninitialized: true
})
);
initializePassport ();
app.use ( passport.initialize ());
app.use ( passport.session ());
app.engine ( "handlebars", engine ());
app.set ( "view engine", "handlebars" );
app.set ( "views", path.resolve ( __dirname, "./views" ));
app.use ( "/static", express.static ( path.join ( __dirname, "/public" )));
app.use ( "/api/carts", routerCart );
app.use ( "/api/products", routerProd );
app.use ( "/api/messages", routerMessages );
app.use ( "/api/session", routerSession );
app.use ( "/api/users", routerUsers );

app.get ( "/setcookie", ( req, res ) => {
    res.cookie ( "CookieTest", "Here the value of a cookie", { maxAge: 60000, signed: true } ).send ( "Cookie created" );
});
app.get ( "/getcookies", ( req, res ) => {
    res.send ( req.signedCookies );

});
app.get ( "/session", ( req, res ) => {
    if ( req.session.counter ) {
        req.session.counter ++;
        res.send ( `You has entered in  ${ req.session.counter } oportunities to the page.` );
    } else {
        req.session.counter = 1;
        res.send ( "Wellcome!" );
    }
});
function authorized ( req, res, next ) {
    const adminMail = "admin@mail.com";
    const adminPass = "4321";
    console.log( req.session.email );
    if ( req.session.email == adminMail && req.session.password == adminPass ) return next ();
    if ( req.session.email && req.session.password ) return res.send ( "Unauthorized user!" );
    return res.send ( "No session active, please login" );
};
app.get ( "/login", ( req,res ) => {
    const { email, password } = req.body;
    if ( email == "admin@mail.com" ) return res.send ( "Please login in admin session. Here" );
    if ( email != "" && password != "" ) {
        req.session.email = email;
        console.log(email);
        req.session.password = password;
        console.log(password);
        return res.send ( `Wellcome ${ email }` );
    } else {
        return res.send ( "Log failed. Email or password incorrect" );
    }
});
app.get ( "/admin", authorized, ( req, res ) => {
    if ( req.session.email && req.session.password ) {
        res.send ( "Administrator session" );
    } else {
        res.send ( "No session active, please login" );
    }
});
app.get ( "/logout", ( req, res ) => {
    req.session.destroy (() => {
        res.send ( "Session terminated" );
    });
});


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
    socket.on ( "newUser", ( userData ) => {
        console.log(userData);
    })
    socket.on ( "newCient", ( clientData ) => {
        console.log(clientData);
    })
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
    const user = [{first_name: "Pocho", last_name: "LaPantera", email: "pochomiau@mail.com", age: 59 }]
    res.render ( "login", {
        title: "Login",
        nombre: "Ingreso de Usuario",
        userDats: user,
        pathCss: "login",
        pathJs: "login"
    })
})

app.get ( "/static/register", async ( req, res ) => {
    const user = [{first_name: "Pocho", last_name: "LaPantera", email: "pochomiau@mail.com", age: 59 }]
    res.render ( "register", {
        title: "Register",
        nombre: "Registro de Cliente",
        clientDats: user,
        pathCss: "register",
        pathJs: "register"
    })
})

app.get ( "/static/products", async ( req, res ) => {
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
        pathCss: "register",
        pathJs: "messages"
    })
})
