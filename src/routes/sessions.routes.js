import { Router } from 'express';
import passport from 'passport';
import { passportError, authorization } from '../utils/errors.js';
import { generateToken } from '../utils/jwt.js';

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
        const token = generateToken ( req.user );
        res.cookie ( "jwtCookie", token, {
            maxAge: 43200000
        })
        res.status ( 200 ).send ({ message: "User created: ", payload: req.user });
    } catch ( error ) {
        res.status ( 500 ).send ({ message: `Error to initiate session ${ error }`})
    }
});

routerSession.get ( "/testjwt", passport.authenticate ( "jwt", { session: false }), async ( req, res ) => {
    res.status ( 200 ).send ({ message: req.user });

    req.session.user = {
        first_name: req.user.user.first_name,
        last_name: req.user.user.last_name,
        email: req.user.user.email,
        age: req.user.user.age
    }
})

routerSession.get ( "/current", passportError ( "jwt" ), authorization ( "user" ), async ( req, res) => {
    res.send ( req.user )
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
