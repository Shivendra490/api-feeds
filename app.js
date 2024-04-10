const express=require('express')

const app=express()
const bodyParser=require('body-parser')

app.use(bodyParser.json());
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods','POST,PUT,PATCH,DELETE')
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
    next()
})

const feedRoutes=require('./routes/feed')

app.use('/feed',feedRoutes)

app.listen(8080)