import { getDB } from "../db/db.js";
export async function isEmailExist (email){
    try {
        const db = getDB(); 
        const user = await db.collection("users").findOne({email:email},{email:true});
        if(user) return true;
        return false;
    } catch(error){
        console.log("error on es email exist",error )
        return true;
    }
}