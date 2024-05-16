const bcrypt=require("bcryptjs")
const { validationResult } = require("express-validator");
const User = require("../models/user");


exports.signup=(req,res,next)=>{
    console.log('start body',req.body)
    const errors=validationResult(req)
   
    if(!errors.isEmpty()){
        const error=new Error('Validation Failed')
        error.statusCode=422
        error.data=errors.array()
        console.log('before errrs')
        console.log('body',req.body)
        throw error
    }
    
    const email=req.body.email;
    const name=req.body.name;
    const password=req.body.password;
    bcrypt.hash(password,12)
    .then(hashedPwd=>{
        const user=new User({email:email,password:hashedPwd,name:name})
        return user.save()
    })
    .then(result=>{
        res.status(201).json({message:"User Created Successfully",_id:result._id})
    })
    .catch(err=>{
        if(!err.statusCode){
            console.log('here500')
            statusCode=500
        }
        next(err)
    })
}