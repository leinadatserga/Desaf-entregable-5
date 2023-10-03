import "dotenv/config";
import jwt from "jsonwebtoken";

export const generateToken = ( user ) => {
    const token = jwt.sign ({ user }, process.env.JWT_SECRET, { expiresIn: "12h" });
    return token;
}

/*console.log( generateToken(
    {"_id":"651c5633e10f176ff93e38df",
    "first_name":"Pablo",
    "last_name":"Escobilla",
    "email":"pabliten@mail.com",
    "password":"$2b$15$sP4klZWaAzY0fid.MnUUae5SskDhbdazCXiE8JXPTYEtV2VJux/BS",
    "age":{"$numberInt":"35"},
    "rol":"admin"},
    {"_id":"651c6257e10f176ff93e38e0",
    "first_name":"Olivia",
    "last_name":"Karibe",
    "email":"olikar@mail.com",
    "password":"$2b$15$c2MF26X5A3oRwe/6PaVmfux3yaeYzEfFYuOy.RUHUSZBSCI2H9Vqi",
    "age":{"$numberInt":"19"},
    "rol":"user"}
));*/

export const authToken = ( req, res, next ) => {
    const authHeader = req.headers.Authorization;
    if ( !authHeader ) {
        return res.status ( 401 ).send ({ error: "User not autenticated"});
    }
    const token = authHeader.split (" ")[ 1 ];
    jwt.sign ( token, process.env.JWT_SECRET, ( error, credentials ) => {
        if ( error ) {
            return res.status ( 403 ).send ({ error: "Unauthorized user"});
        }
        req.user = credentials.user;
        next ();
    })
};