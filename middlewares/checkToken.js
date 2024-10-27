import { sendGenericError } from "../helpers/send-response/sendResponse.js";

export const  checkToken = (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return sendGenericError(res,400,"No user found");
    }
    next();
}