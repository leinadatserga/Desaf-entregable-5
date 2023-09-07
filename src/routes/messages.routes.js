import { Router } from 'express';
import messageModel from '../models/messages.models.js';


const routerMessages = Router ();
routerMessages.get ( "/", async ( req, res ) => {
    try {
        const messages = await messageModel.find ();
        res.status ( 200 ).send ({ result: "Ok", messages: messages })
    } catch ( error ) {
        res.status ( 400 ).send ({ error: `Error checking messages: ${ error }`})
    }
});
routerMessages.get ( "/:email", async ( req, res ) => {
    const { email } = req.params;
    try {
        const findMessage = await messageModel.findOne ({ email });
        if ( findMessage ) {
            const message = await messageModel.find ({ email });
            res.status ( 200 ).send ({ result: "Ok", message: message })
        } else {
            res.status ( 404 ).send ({ result: "Not found" })
        }
    } catch ( error ) {
        res.status ( 400 ).send ({ error: `Error getting messages: ${ error }`})
    }
});
routerMessages.post ( "/", async ( req, res ) => {
    const { email, message } = req.body
    try {
        const newMessage = await messageModel.create ({ email, message });
        res.status ( 200 ).send ({ result: "Ok", message: newMessage })
    } catch ( error ) {
        res.status ( 400 ).send ({ error: `Error creating message: ${ error }` })
    }
});
routerMessages.delete ( "/:email", async ( req, res ) => {
    const { email } = req.params;
    try {
        const deletedMessages = await messageModel.findOneAndDelete ( email );
        deletedProduct ? res.status ( 200 ).send ({ result: "Ok", message: deletedMessages }) : res.status ( 404 ).send ({ result: "Not found" })
    } catch ( error ) {
        res.status ( 400 ).send ({ error: `Error deleting message: ${ error }` })
    }
});
export default routerMessages;