
const express = require('express') ;

const router = express.Router() ;



import bcrypt from "bcrypt" ;

import jwt from "jsonwebtoken" ;

import UserModel from "../Models/User" ;
const JWT_SECRET = process.env.JWT_SECRET || "hello" ;

router.use(express.json()) ;

router.post('/register' , async (req:any  , res:any)=> {

    try{
        const {name , email , password } = req.body ;
        if(!name || !email || !password){

            res.status(400).json({
                msg:"Missing fields" 
            }) ;

        }

        const existing = await UserModel.findOne({email}) ;
        if(existing){
            return res.status(400).json({
                msg:"Email already exists" 
            }) ;
        }

        const salt = await bcrypt.genSalt(10) ;
        const hash = await bcrypt.hash(password , salt) ;

        const user = new UserModel({name , email , password:hash}) ;
        await user.save() ;
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
        res.status(201).json({token , user: {id:user._id , name: user.name , email: user.email}}) ;
    }
    catch(err) {
        console.log(err) ;
        res.status(500).json({msg: "server error"}) ;
    }


}) ;

router.post("/login", async (req:any , res:any) => {

    try {

        const {email , password} = req.body ;
        if(!email || !password) {
            return res.status(400).json({
                msg:"Missing fields"
            }) ;
        }

        const user = await UserModel.findOne({email});
        if(!user) {
            return res.status(400).json(
                {
                    msg: "Invalid credentials" 
                }
            )
        }

        const isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch) {
            return res.status(400).json({
                msg:"Invalid credentials" 
            }) ;
        }

         const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
         res.json({ token, user: { id: user._id, name: user.name, email: user.email } });


    }
    catch(err) {
            console.log(err) ;
            res.status(500).json({
                msg:"server error" 
            })
    }


}) ;




export default router ;
