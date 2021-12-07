var express = require("express")
var app = express() ;
var dotenv = require('dotenv') ;
const mongoose = require('mongoose')
const port = 3002 ;
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const bodyparser = require('body-parser');
const nodemailer = require('nodemailer');
const Register = require('./register');
//const requestIp = require('request-ip');
dotenv.config() ;
const phash = new Map([
    ["cricket",0],
    ["football",1],
    ["music",2],
    ["pets",3],
    ["politics",4]
]) ;
const schema = new mongoose.Schema({
    name : String,
    number: String,
    dept: String,
    Year: String,
    email : String,
    bio : String,
    password : String,
    hobbies: String,
    passion:[String],
    ihash: [Number] ,
    matches: Number,
    connected: [String],
    matchreq:[String],
    gender: String,
    profileimage: String,
    image:[String]
  });
var People = mongoose.model('users',schema) ;
app.set('view engine', 'pug');
app.use(express.json()) ; //Middleware
app.use(cors()) ;
app.enable('trust proxy')
app.get('/' , (req,res)=>{
    console.log(req.ip);
    res.json('Hi World') ;
});
app.get('/getuser/:userId',(req,res)=>{
    People.find({_id:req.params.userId},(err,result)=>{
    res.status(200).json(result) ;
    })
})
app.get('/authentication/:token',(req,res)=>{Register.verify(req,res,bcrypt,People)}) ;
app.post('/api',(req,res)=>{
    const { gender,ihash } = req.body ;
    var arr = [] ;
    People.find({'gender':gender},(err,result)=>{
        //console.log(result) ;
        result.forEach((item)=>{
        var obj = {} ;
        var count = 0 ;
        if(ihash.length != 0)
        {
        for(var i=0;i<5;i++){
            if(ihash[i] == item.ihash[i]) {
                if(ihash[i])count+=2 ;
                else count ++ ;
            }
            else{
                count-- ;
            }
        }
    }
        obj['name'] = item.name ;
        obj['age'] = item.age ;
        obj['bio'] = item.bio ;
        obj['Year'] = item.Year ;
        obj['passion'] = item.passion ;
        obj['gender'] = item.gender ;
        obj['matches'] = item.matches ;
        obj['percent'] = count ;
        obj['profilepic'] = item.profileimage ;
        obj['image'] = 
        arr.push(obj) ;
        })
        arr.sort((a,b)=>{
          return b.percent-a.percent ;              //sorting the entries in descending order of count
        }) ;
        res.status(200).json(arr) ;
    })
})
app.post('/register',(req,res)=>{Register.register(req,res,bcrypt,nodemailer,People)}) ;
app.post('/login',(req,res)=>{
    const {email,password} = req.body ;
    People.find({'email':email},(err,result)=>{
          if(result.length>0){
            if(bcrypt.compareSync(password , result[0].password)) res.status(200).json(result) ;
            else res.status(400).json("Wrong Password") ;
          }
          else res.status(400).json("No such user exists , Pls Register") ;
    }) ;
})
app.post('/update',(req,res)=>{
    const {email,password,number,bio,hobbies,interests,department,Year,gender} = req.body ;
    var arr = [] ;
            if(interests.length > 0){
             arr = new Array(5).fill(0);
            interests.forEach((i)=>{
                arr[phash.get(i)]++ ;
            })
        }
    People.updateOne({'email':email},{
          number : number ,
          bio : bio ,
          hobbies : hobbies ,
          passion : interests ,
          ihash : arr ,
          department : department ,
          Year : Year ,
          gender: gender
},(err,response)=>{
 if(err) throw err ;
 res.status(200).json('Profile succesfully updated') ;
});
})
app.post('/sendreq',(req,res)=>{
  const {email,emailsender} = req.body ;
  People.find({'email':email},(err,result)=>{
    result.forEach((item)=>{
        var obj = {} ;
        People.find({'email':emailsender},(err,result)=>{
            result.forEach((i)=>{
                obj['name'] = i.name ;
                obj['age'] = i.age ;
                obj['bio'] = i.bio ;
                obj['Year'] = i.Year ;
                obj['passion'] = i.passion ;
                obj['gender'] = i.gender ;
                obj['matches'] = i.matches ; 
            })
        })
        var b = item.matchreq;
        b.push(obj) ;
        People.updateOne({'email':emailsender},{
                        matchreq: b
                      })
    })
    res.status(200).json('Request Sent !') ;
  });
}) ;
app.post('/resreq',(req,res)=>{
 const {des,email,emailsender} = req.body ;
 People.find({'emsil':email},(err,result)=>{
     result.forEach((item)=>{
         if(des == 1){
             var n = item.matches ;
             var a = {} ;
             a['name'] = item.name ;
             a['age'] = item.age ;
             a['bio'] = item.bio ;
             a['Year'] = item.Year ;
             a['passion'] = item.passion ;
             a['gender'] = item.gender ;
             a['matches'] = item.matches ; 
             a['id'] = item._id ;
             People.find({'email':emailsender},(err,result)=>{
                 var obj = {} ;
                 result.forEach((i)=>{
                     var num = i.matches ;
                     obj['name'] = i.name ;
                     obj['age'] = i.age ;
                     obj['bio'] = i.bio ;
                     obj['Year'] = i.Year ;
                     obj['passion'] = i.passion ;
                     obj['gender'] = i.gender ;
                     obj['matches'] = i.matches ; 
                     obj['id'] = i._id ;
                     var b = i.connected ;
                     b.push(a) ;
                     People.updateOne({'email':emailsender},
                      {
                        matches:num+1,
                        connected:b
                      }
                     )
                 })
             })
            var B = item.connected ;
            B.push(obj) ;
            var m = item.matchreq;
            m.filter(i => i != emailsender) ;
             People.updateOne({'email':emailsender},
             {
                matches:n+1,
                connected: B,
                matchreq:m
             })
         }
         else{
            var m = item.matchreq;
            m.filter(i => i != emailsender) ;
             People.updateOne({'email':emailsender},
             {
                matchreq:m
             })
         }
     })
 })
});
app.listen(process.env.PORT || port , ()=> {
    mongoose.connect(process.env.mongopath,{
        useNewUrlParser: true ,
        useUnifiedTopology: true
    }).then(()=>{
        console.log('Connection Succesful !!!')
    }).catch((err)=> console.log(err))
  })