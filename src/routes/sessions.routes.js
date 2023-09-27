import { Router } from 'express';
import userModel from '../models/users.model.js';
import { validatePassword } from '../utils/bcrypt.js';
import passport from 'passport';


const routerSession = Router ();

routerSession.post ( "/login", passport.authenticate ( "login" ), async ( req, res ) => {
    try {
        if ( !req.user ) {
            return res.status ( 401 ).send ({ message: "Invalid user" })
        }
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age
        }
        res.status ( 200 ).send ({ message: "User created: ", payload: req.user });
    } catch ( error ) {
        res.status ( 500 ).send ({ message: `Error to initiate session ${ error }`})
    }
});

routerSession.get ( "/github", passport.authenticate ( "github", { scope: [ "user: email" ]}), async ( req, res ) => {
    res.status ( 200 ).send ({ message: "User created: ", payload: req.user });
});

routerSession.get ( "/githubSession", passport.authenticate ( "github" ), async ( req, res ) => {
    req.session.user = req.user;
    res.status ( 200 ).send ({ message: "Session created: ", payload: req.user });
});
routerSession.get ( "/logout", ( req, res ) => {
    if ( req.session.login ) {
        req.session.destroy ();
    }
    res.status ( 200 ).send ({ result: "Logout done" });
});

export default routerSession;
/*routerSession.post ( "/login", async ( req, res ) => {
    const { email, password } = req.body;
    const sessionStatus = req.session.login;
    try {
        const user = await userModel.findOne ({ email: email });
        if ( user && !sessionStatus ) {
            if ( validatePassword ( password, user.password )) {
                req.session.login = true;
                //res.status ( 200 ).send ({ result: "Logged successfully!", user: user.first_name + " " + user.last_name });
                res.redirect ( "/static/", 200, { result: "Logged successfully!", "user": "user.first_name" + " " + "user.last_name" });
            } else {
                res.status ( 401 ).send ({ result: "Password incorrect" });
            };
        } else {
            sessionStatus ? res.status ( 200 ).send ({ result: "You're logged!" }) : res.status ( 404 ).send ({ result: "Invalid user. Please register" });
        };
    } catch (error) {
        res.status ( 400 ).send ({ error: `Login failed: ${ error }` });
    }
});*/