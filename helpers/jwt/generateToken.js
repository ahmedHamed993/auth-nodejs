import jwt from "jsonwebtoken";
const EXPIRES_IN_DAYS = 30
export function generateToken(payload){
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:`${EXPIRES_IN_DAYS}d`} );
    return {token, expiresIn:`${EXPIRES_IN_DAYS}d` };
}

export function setTokenToCookies(res, token){
    res.cookie("token",token,{
        maxAge:EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
        httpOnly:true,
        secure: process.env.NODE_ENV==='production',
        sameSite:'strict',
    })
}

export function isTokenValid(token){
   return jwt.verify(token, process.env.JWT_SECRET,(err,decoded)=>{
        if (err?.name === 'TokenExpiredError') return true;
        if(err) return false;
        return true;
    });
}