const exp =require('express');
const registrationApp = exp.Router();
const expressAsyncHandler = require('express-async-handler');
require('dotenv').config();

// get scannercollection app

let scannercollection;

registrationApp.use((req,res,next)=>{
    scannercollection=req.app.get('scannercollection');
    next();
})

registrationApp.put('/register',expressAsyncHandler(async(req,res)=>{
    const newRegister = req.body;
    const dbuser = await scannercollection.findOne({email:newRegister.email});
    if(dbuser!==null)
        {
            if(dbuser.entered===false){
                res.send({message:"Allow To Workshop"})
                await scannercollection.updateOne({email:newRegister.email},{$set:{entered:true}});
            }
            else
            res.send({message:"Already Scanned Dont Allow to enter"})
        }
    else{
        console.log(newRegister);
        res.send({message:"Not registered for Workshop"});
    }
}
))

module.exports=registrationApp;