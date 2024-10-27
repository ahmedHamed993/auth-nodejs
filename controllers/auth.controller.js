import Joi from "joi";
import {sendGenericError, sendInputValidationError, sendSuccess} from "../helpers/send-response/sendResponse.js";
import { getDB } from "../helpers/db/db.js";
import { isEmailExist } from "../helpers/email/isEmailExist.js";
import { generateToken, isTokenValid, setTokenToCookies } from "../helpers/jwt/generateToken.js";
import { ROLES } from "../utils/roles.js";
import bcrypt from "bcrypt";


const SALT_ROUNDS = 10;


// signup validation schema
const signupValidationSchema = Joi.object({
  name: Joi.string().min(3).required("field required"),
  email: Joi.string().email().required("field required"),
  password: Joi.string().min(6).required("field required"),
});

// login validation schema
const loginValidationSchema = Joi.object({
    email: Joi.string().email().required("field required"),
    password: Joi.string().min(6).required("field required"),
});


export async function signup(req, res){

    const { error } = signupValidationSchema.validate(req.body, { abortEarly : false });

    if(error){
       return sendInputValidationError(res, error.details);
    }

    const {name, email, password} = req.body;

    const emailNotUnique = await isEmailExist(email);

    if(emailNotUnique){
       return sendGenericError(res, 409, "User Already Exist");
    }

    const db = getDB(); 

    let hashedPassword = await generateHashedPassword(password);
    if(!hashedPassword){
        console.log("hashing the password failed!");
        return sendGenericError(res, 400, "SOME THING WENT WRONG");
    }

    const roles  = [ROLES.admin, ROLES.user];

    const newUser = {name, email,password:hashedPassword, roles};
    
    const createdUser = await  db.collection("users").insertOne(newUser);
    
    const {token,expiresIn} = generateToken({ _id:createdUser.insertedId, name, email, roles});
    setTokenToCookies(res, token);
    return sendSuccess(
        res, 
        201, //status 
        `Welcome MR/MRS ${name}`,  //message 
        { //data
            user : {name, email, roles, _id:createdUser.insertedId}, 
            token: { value:token ,expiresIn:expiresIn }
        }
    );
}

export async function login(req,res){
    const { error } = loginValidationSchema.validate(req.body, {abortEarly:false});
    if(error){
        return sendInputValidationError(res, error.details);
    }

    const {email, password} = req.body;

    const db = getDB(); 
    const user = await db.collection("users").findOne({email:email});

    if(!user){
        return sendGenericError(res, 400, 'User Not Found');
    }

    const isPasswordCorrect =  await isPasswordMath(password, user.password);

    if(!isPasswordCorrect){
        return sendGenericError(res, 400, 'Your Email Or Password Is Not Correct');
    }

    const {_id, name, roles} = user;
    const {token, expiresIn} = generateToken({_id, name, email, roles})
    setTokenToCookies(res, token);

    return sendSuccess(
        res, 
        200 ,
        `Welcome MR/MRS ${name}`, 
        {
            user : {_id, name, email, roles}, 
            token: { value:token ,expiresIn:expiresIn }
        }
    );
}


export async function logout(req,res){
    const authToken = getUserTokenFromReq(req);
    const validToken = isTokenValid(authToken);
    if(!validToken){
        return sendGenericError(res, 400, "Invalid Token");
    }
    res.clearCookie("token");
    return sendSuccess(res, 200, "User Logged Out Successfully");
}

function generateHashedPassword(password){
    return bcrypt.hash(password, SALT_ROUNDS).then((hash) => hash).catch(error => null)
}

async function isPasswordMath(rawPassword, hashedPassword){
    const match = await  bcrypt.compare(rawPassword, hashedPassword);
    if(match) return true;
    return false;
}


function getUserTokenFromReq(req){
    let token = undefined;
    const authKey = ('authorization' || 'Authorization').toLowerCase();
    if(req.headers && req.headers[authKey] ){
        token = req.headers[authKey]?.split(" ")[1]; // split to get chars after Bearer 
        return token;
    }
    token = req.cookies.token;
    return token
}