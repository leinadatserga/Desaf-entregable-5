import { Router } from 'express';
import userModel from '../models/users.model.js';
import { createHash } from '../utils/bcrypt.js';
import passport from 'passport';



const routerUsers = Router ();

routerUsers.post ( "/", passport.authenticate ( "register" ), async ( req, res ) => {
    try {
        if ( !req.user ) {
            res.status ( 400 ).send ({ message: "Existing user" });
        }
        res.status ( 200 ).send ({ message: "User created", user: req.user });
    } catch (error) {
        res.status ( 500 ).send ({ message: `Error creating user: ${ error }`}); 
    }
});

export default routerUsers;

/*routerUsers.post ( "/", async ( req, res ) => {
    const { first_name, last_name, email, password, age } = req.body;
    try {
        const hashPassword = createHash ( password );
        const user = await userModel.create ({ first_name, last_name, email, password: hashPassword, age });
        res.status ( 200 ).send ({ result: "User created", user: user });
    } catch (error) {
        res.status ( 400 ).send ({ error: `Error creating user: ${ error }`}); 
    }
});*/
