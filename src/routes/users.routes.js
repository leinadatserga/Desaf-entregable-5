import { Router } from 'express';
import userModel from '../models/users.model.js';
import { createHash } from '../utils/bcrypt.js';


const routerUsers = Router ();

routerUsers.post ( "/", async ( req, res ) => {
    const { first_name, last_name, email, password, age } = req.body;
    try {
        const hashPassword = createHash ( password );
        const user = await userModel.create ({ first_name, last_name, email, password: hashPassword, age });
        res.status ( 200 ).send ({ result: "User created", user: user });
    } catch (error) {
        res.status ( 400 ).send ({ error: `Error creating user: ${ error }`}); 
    }
});

export default routerUsers;
