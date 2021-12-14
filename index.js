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
["Cricket",0],
["Football",1],
["Swimming",2],
["MMA/Boxing",3],
["E-Sports",4],
["Karate",5],
["Astrology",6],
["Science & Technology",7],
["Hardcore Engineering",8],
["AI",9],
["Coding",10],
["Psychology",11],
["Philosophy",12],
["Western Music",13],
["Indian Classical Music",14],
["Rap Music",15],
["Bollywood Songs",16],
["Bengali Songs",17],
["Classic English Films",18],
["Classic Hindi Films",19],
["Contemporary English Films",20],
["Contemporary Bollywood Films",21],
["Bengali Movies",22],
["Video Games",23],
["Politics",24],
["Debates",25],
["Fitness/Gym",26],
["Puppies/Dogs",27],
["Cats/Kittens",28],
["K-Pop",29],
["Anime",30],
["Finance",31],
["Graphic Designing",32],
["Fashion",33],
["Painting",34],
["Writing",35],
["Reading",36]
]) ;
function getKey(value) {
    return [...phash].find(([key, val]) => val == value)[0]
  }
const schema = new mongoose.Schema({
    name : String,
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
    image:[String],
    insearch: String,
    fb: String,
    insta: String,
    twitter: String
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
        if(item.ihash.length != 0){
        var obj = {} , intr = [];
        var count = 0 ;
        if(ihash.length != 0)
        {
        for(var i=0;i<5;i++){
            if(ihash[i] == item.ihash[i]) {
                if(ihash[i]){count+=2 ;
                intr.push(getKey(i)) ;
                
                }
                else count ++ ;
            }
        }
    }
        obj['name'] = item.name ;
        obj['age'] = item.age ;
        obj['bio'] = item.bio ;
        obj['Year'] = item.Year ;
        obj['passion'] = item.hobbies ;
        obj['department'] = item.dept ;
        obj['insearch'] = item.insearch ;
        obj['interests'] = intr ;
        obj['gender'] = item.gender ;
        obj['matches'] = item.matches ;
        obj['percent'] = (count/10)*100 ;
        obj['image'] = item.image ;
        arr.push(obj) ;
        }
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
    const {email,password,bio,hobbies,interests,department,Year,image,insearch,fb,insta,twitter,profilepic} = req.body ;
    var arr = [] ;
            if(interests.length > 0){
             arr = new Array(5).fill(0);
            interests.forEach((i)=>{
                arr[phash.get(i)]++ ;
            })
        }
        image.unshift(profilepic) ;
    People.updateOne({'email':email},{
          bio : bio ,
          hobbies : hobbies ,
          passion : interests ,
          ihash : arr ,
          department : department ,
          Year : Year ,
          insearch:insearch,
          fb:fb,
          insta:insta,
          twitter:twitter,
          image:image
          
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
                obj['profilepic'] = i.image[0] ;
                obj['id'] = i._id ;
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
             a['profilepic'] = item.image[0] ;
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
                     obj['profilepic'] = i.image[0] ;
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
