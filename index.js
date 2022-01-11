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
 function arrayRotate(arr, count) {
    count -= arr.length * Math.floor(count / arr.length);
    arr.push.apply(arr, arr.splice(0, count));
    return arr;
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
    twitter: String,
    age:Number
  });
const schema1 = new mongoose.Schema({
    userid: String,
    index: Number,
    reqlist : [String],
     emailuser : String
  })
/*
  var whitelist = ['http://localhost:3000','https://flirtaid-nyk.web.app']
  var corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }
app.use(cors(corsOptions)) ;
*/
app.use(cors()) ;
var People = mongoose.model('users',schema) ;
var Index = mongoose.model('index',schema1) ;
app.set('view engine', 'pug');
app.use(express.json()) ; //Middleware
app.enable('trust proxy')
app.get('/' , (req,res)=>{
    console.log(req.ip);
    res.json('Hi World') ;
});
app.get('/getphoto/:userId',(req,res)=>{
  People.find({_id:req.params.userId},(err,result)=>{
  result[0].image.length > 0 ?res.status(200).json(result[0].image[0]):res.status(200).json('') ;
  })
})
app.get('/getuser/:userId',(req,res)=>{
    People.find({_id:req.params.userId},(err,result)=>{
    res.status(200).json(result) ;
    })
})
app.get('/getreqlist/:userId',(req,res)=>{
  Index.find({"userid":req.params.userId},async(err,result)=>{
    var arr = [] ;
    console.log(arr)
    await Promise.all(result[0].reqlist.map(async (item)=>{
      await People.find({"_id":item},(err,ress)=>{
        var obj = {} ;
        obj['name'] = ress[0].name ;
        obj['dept'] = ress[0].dept ;
        obj['Year'] = ress[0].Year ;
        obj['image'] = ress[0].image ;
        obj['desc'] = ress[0].desc ;
        obj['hobbies'] = ress[0].hobbies ;
        obj['passion'] = ress[0].passion ;
        obj['matches'] = ress[0].matches ;
        obj['bio'] = ress[0].bio ;
        obj['insearch'] = ress[0].insearch ;
        if(ress[0].connected.includes(req.params.userId))
        { 
          obj['status'] = "Accepted" ;
          console.log(obj) ;
        }
        else if(ress[0].matchreq.includes(req.params.userId))
        {        
          obj['status'] = "Pending" ;
          console.log(obj) ;
         }
        else{        
          obj['status'] = "Rejected" ;
          console.log(obj) ;
        }
        arr.push(obj)
      }).clone()
    })
    )
    res.status(200).json(arr)
  }).clone()
  .catch(err => res.status(400).json(err))
})
app.get('/getmatchlist/:userId',(req,res)=>{
  People.find({"_id":req.params.userId},async(err,result)=>{
    var arr = [] ;
    console.log(arr)
    await Promise.all(result[0].matchreq.map(async (item)=>{
      await People.find({"_id":item},(err,ress)=>{
        var obj = {} ;
        obj['name'] = ress[0].name ;
        obj['dept'] = ress[0].dept ;
        obj['Year'] = ress[0].Year ;
        obj['image'] = ress[0].image ;
        obj['desc'] = ress[0].desc ;
        obj['hobbies'] = ress[0].hobbies ;
        obj['passion'] = ress[0].passion ;
        obj['matches'] = ress[0].matches ;
        obj['bio'] = ress[0].bio ;
        obj['insearch'] = ress[0].insearch ;
        obj['_id'] = ress[0]._id ;
        arr.push(obj)
      }).clone()
    })
    )
    res.status(200).json(arr)
  }).clone()
  .catch(err => res.status(400).json(err))
})
app.get('/getconnected/:userId',(req,res)=>{
  People.find({"_id":req.params.userId},async(err,result)=>{
    var arr = [] ;
    console.log(arr)
    await Promise.all(result[0].connected.map(async (item)=>{
      await People.find({"_id":item},(err,ress)=>{
        var obj = {} ;
        obj['name'] = ress[0].name ;
        obj['dept'] = ress[0].dept ;
        obj['Year'] = ress[0].Year ;
        obj['desc'] = ress[0].desc ;
        obj['image'] = ress[0].image ;
        obj['hobbies'] = ress[0].hobbies ;
        obj['passion'] = ress[0].passion ;
        obj['matches'] = ress[0].matches ;
        obj['bio'] = ress[0].bio ;
        obj['insearch'] = ress[0].insearch ;
        obj['_id'] = ress[0]._id ;
        arr.push(obj)
      }).clone()
    })
    )
    res.status(200).json(arr)
  }).clone()
  .catch(err => res.status(400).json(err))
})
app.get('/authentication/:token',(req,res)=>{Register.verify(req,res,bcrypt,People,Index)}) ;
app.post('/api',(req,res)=>{
    const { email,gender,ihash } = req.body ;
    var m_req = [] ,id , con ;
    var Gender ;
    console.log(email) ;
    People.find({'email':email},(err,result)=>{
       m_req = result[0].matchreq ;
       id = result[0]._id ;
       con = result[0].connected ;
       if(result[0].gender == 'Male') Gender = 'Female' ;
       else Gender = 'Male' ;
    var arr = [] ;
    var flag = 0 ;
    People.find({'gender':Gender},(err,result)=>{
        //console.log(result) ;
        result.forEach((item)=>{
        if(item.ihash.length != 0){
          if (item.matchreq.includes(id)){
            flag = 1 ;
          }
          if(item.connected.includes(id)){
            flag = 2 ;
          }
        var obj = {} , intr = [];
        var count = 0 ;
        if(ihash.length != 0)
        {
        for(var i=0;i<37;i++){
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
        obj['percent'] = Math.round((count/37)*100) ;
        obj['image'] = item.image ;
        obj['email'] = item.email ;
        obj['flag'] = flag ;
        arr.push(obj) ;
        }
        })
        arr.sort((a,b)=>{
          return b.percent-a.percent ;              //sorting the entries in descending order of count
        }) ;
        var idx ;
        Index.find({'userid':id},(err,result)=>{ idx = result[0].index })
        arr = arrayRotate(arr,idx) ;
        res.status(200).json(arr) ;
    })
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
    const {email,password,bio,hobbies,interests,department,Year,image,insearch,insta,age} = req.body ;
    var arr = [] ;
            if(interests.length > 0){
             arr = new Array(37).fill(0);
            interests.forEach((i)=>{
                arr[phash.get(i)]++ ;
            })
        }
    People.updateOne({'email':email},{
          bio : bio ,
          hobbies : hobbies ,
          passion : interests ,
          ihash : arr ,
          dept : department ,
          Year : Year ,
          insearch:insearch,
          insta:insta,
          image:image,
          age:age
          
},(err,response)=>{
 if(err) throw err ;
 res.status(200).json('Profile succesfully updated') ;
});
})
app.post('/sendreq',(req,res)=>{
  const {email,emailsender} = req.body ;
  console.log(email,emailsender) ;
  People.find({'email':emailsender},(err,result)=>{
            result.forEach((i)=>{
              var id ;
              People.find({'email':email},(err,re)=>{
                if(i.matchreq.includes(re[0]._id))
                {
                  return res.status(200).json('The person has already sent a like request to you , Pls accept that instead of sending the like request back') ;
                }
                id = re[0]._id ;
                if(re[0].matchreq.includes(i._id))
                {
                  return res.status(200).json('Request already sent') ;
                }
                else{
                  People.findOneAndUpdate({'email':email},{ $push : { matchreq: i._id }},(err,ress)=>{
                    Index.findOneAndUpdate({'userid':i._id},{ $push : { reqlist: id }},{$inc : {'index' : 1}},(e,ress)=>{
                      return res.status(200).json('Request Sent !') ;
                    })
                  })
                }
              })

            })
  });
}) ;
app.post('/resreq',(req,res)=>{
 const {des,senderid,receiverid} = req.body ;
 People.find({'_id':receiverid},(err,result)=>{
     result.forEach((item)=>{
         if(des == 1){
             var n = item.matches ;
             var B = item.connected ;
             B.push(senderid) ;
             var m = item.matchreq;
             m = m.filter(i => i != senderid) ;
              People.updateOne({'_id':receiverid},
              {
                 matches:n+1,
                 connected: B,
                 matchreq:m
              },function (err, docs){
                if (err){
                  console.log(err)
                  res.status(200).json("Error occured !") ;
              }
              People.findOneAndUpdate({'_id':senderid},{ $push : { connected: receiverid } , $inc : {'matches' : 1}},(err,ress)=>{
                if (err){
                  console.log(err)
                  res.status(200).json("Error occured !") ;
              }
                res.status(200).json("Accepted !")
              })
              })
              }        
         else{
            var m = item.matchreq;
           m =  m.filter(i => i != senderid) ;
             People.updateOne({'_id':receiverid},
             {
                matchreq:m
             },function (err, docs){
              if (err){
                console.log(err)
                res.status(200).json("Error occured !") ;
            }
            res.status(200).json("Rejected !") ;
             })
             console.log(m) ;
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
