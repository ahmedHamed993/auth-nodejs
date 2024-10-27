import express from "express";
import 'dotenv/config'
import authRoutes from "./routes/auth.route.js";
import { connectToDB } from "./helpers/db/db.js";
import cookieParser from "cookie-parser";

let db  = null;

const app = express();
app.use(express.json());
app.use(cookieParser());


app.get("/",async(req,res)=>{
    try{
        const users = await db.collection("users").find({},{ 
                projection:{_id:true, name:true, email:true, isVerified:true, createdAt:true, updatedAt:true} 
            }).toArray();
        res.status(200).json({
            data:users,
            success:true,
            status:200,
            message:"Users returned successfully"
        })
    } catch(error){
        res.status(500).json({
            message:"failded",
            success:false,
        })
    }
})

app.use("/api/v1/auth", authRoutes);

app.listen(process.env.PORT, async ()=>{
    console.log('app listening on port',process.env.PORT);
    await connectToDB();
})