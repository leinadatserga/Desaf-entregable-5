import { Router } from 'express';
import userModel from '../models/users.model.js';
import { validatePassword } from '../utils/bcrypt.js';


const routerSession = Router ();
routerSession.post ( "/login", async ( req, res ) => {
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
});
routerSession.get ( "/logout", ( req, res ) => {
    if ( req.session.login ) {
        req.session.destroy ();
    }
    res.status ( 200 ).send ({ result: "Logout done" });
});

export default routerSession;
