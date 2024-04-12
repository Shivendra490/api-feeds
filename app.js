const path=require('path')

const express=require('express')
const mongoose=require('mongoose')
const dotenv=require('dotenv')

dotenv.config()
const app=express()
const bodyParser=require('body-parser')

app.use(bodyParser.json());
app.use('/images',express.static(path.join(__dirname,'images')))
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods','POST,PUT,PATCH,DELETE')
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
    next()
})

const feedRoutes=require('./routes/feed')

app.use('/feed',feedRoutes)

app.use((error,req,res,next)=>{
    const status=error.statusCode
    const message=error.message
    res.status(status).json({message:message})
})

mongoose.connect(process.env.DB_URI).then(result=>{
    console.log('DB Connected')
    app.listen(8080)
}).catch(err=>console.log(err))
