import "dotenv/config"
import express, { json } from 'express';
import cookieParser from "cookie-parser";
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import router from "./routes/api.routes.js";
import mongoose from 'mongoose';
import { __dirname } from './path.js';
import path from 'path';
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
app.use ( cookieParser ( process.env.JWT_SECRET ));
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
app.use ( "/", router );

