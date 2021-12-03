var express = require("express")
var app = express() ;
var dotenv = require('dotenv') ;
const mongoose = require('mongoose')
const port = 3002 ;
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
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
app.use(express.json()) ; //Middleware
app.use(cors()) ;
app.get('/' , (req,res)=>{
    res.json('Hi World') ;
});
app.get('/getuser/:userId',(req,res)=>{
    People.find({_id:req.params.userId},(err,result)=>{
    res.status(200).json(result) ;
    })
})
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
app.post('/register',(req,res)=>{
    const { email,name,password,gender } = req.body ;  //Destructuring
    var bio = '',number='',interests=[],hobbies='',dept='',Year='' ;
    if(!email||!name||!password)
    {
       if(!email)
       {
        return res.status(400).json('Pls enter your email id') ;
       }
       if(!password)
       {
        return res.status(400).json('Pls enter your password') ;
       }
       if(!name)
       {
        return res.status(400).json('Pls enter your name') ;
       }
    }
    const hash = bcrypt.hashSync(password) ;
    People.find({'email':email},(err,result)=>{
        if(err) throw err ;
        if(result.length){res.status(200).json('User with the same Email Already Exists');
    }
        else{
            var arr = [] ;
            if(interests.length > 0){
            const arr = new Array(5).fill(0);
            interests.forEach((i)=>{
                arr[phash.get(i)]++ ;
            })
        } //If user has not completed his/her profile
            new People({
                name : name,
                number : number,
                email: email,
                bio:bio,
                password: hash,
                hobbies:hobbies,
                passion:interests,
                ihash:arr,
                dept:dept,
                Year:Year,
                gender:gender
            }).save((err,result)=>{
                if(err) throw err ;
                else res.status(200).json('Success!')
            })
        }
    })
})
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
        item.matchreq.push(obj) ;
    })
    res.status(200).json('Request Sent !') ;
  });
}) ;
app.post('/resreq',(req,res)=>{
 const {des,email,emailsender} = req.body ;
 People.find({'emsil':email},(err,result)=>{
     result.forEach((item)=>{
         if(des == 1){
             item.matches++ ;
             var a = {} ;
             a['name'] = item.name ;
             a['age'] = item.age ;
             a['bio'] = item.bio ;
             a['Year'] = item.Year ;
             a['passion'] = item.passion ;
             a['gender'] = item.gender ;
             a['matches'] = item.matches ; 
             People.find({'email':emailsender},(err,result)=>{
                 var obj = {} ;
                 result.forEach((i)=>{
                     i.matches++ ;
                     obj['name'] = i.name ;
                     obj['age'] = i.age ;
                     obj['bio'] = i.bio ;
                     obj['Year'] = i.Year ;
                     obj['passion'] = i.passion ;
                     obj['gender'] = i.gender ;
                     obj['matches'] = i.matches ; 
                     i.connected.push(a) ;
                 })
             })
             item.connected.push(obj) ;
             item.matchreq.filter(i => i != emailsender) ;
         }
         else{
            item.matchreq.filter(i => i != emailsender) ; 
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