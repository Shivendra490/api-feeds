const path=require('path')

const feedRoutes=require('./routes/feed')

const express=require('express')
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const multer=require('multer')
const bodyParser=require('body-parser')

dotenv.config()
const app=express()

const fileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images')
    },
    filename:(req,file,cb)=>{
        console.log('file',file)
        cb(null,new Date().toISOString()+'-'+file.originalname);
    }
})

const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/png' || file.mimetype==='image/jpg' || file.mimetype==='image/jpeg') {
        cb(null,true)
    }else{
        cb(null,false)
    }
}


app.use(bodyParser.json());
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'))


app.use('/images',express.static(path.join(__dirname,'images')))
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods','POST,PUT,PATCH,DELETE')
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
    next()
})



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
