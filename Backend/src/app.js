import express from "express";
import { createServer } from "node:http";

import {Server} from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManagement.js";

import cors from "cors";
import userRoutes from "./routes/usersroutes.js";


const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port",(process.env.PORT||8000))
app.use(cors());
app.use(express.json({limit:"40kb"}))
app.use(express.urlencoded({limit: "40kb",extended: true}));
app.use("/api/v1/users", userRoutes);
// app.use("/api/v2/users",newUserRoutes);


// app.get("/home",(req,res)=>{
//     return res.json({"hello":"world"})
// });

const start = async()=>{
    app.set("mongo_user")
    const connectionDb = await mongoose.connect("mongodb+srv://2k23cs2311826_db_user:ridhi0117@cluster0.dzeoyvs.mongodb.net/videocall?retryWrites=true&w=majority");
    console.log(`mongo connected db: ${connectionDb.connection.host}`);
    server.listen(app.get("port"),()=>{
        console.log("port chalu ho gya");
    });
}

start();