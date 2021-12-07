const jwt = require ('jsonwebtoken');
const mongoose = require('mongoose') ;
const account_activate_api_key = "accountactivate123";
CLIENT_URL="https://faid-api.herokuapp.com";
const schema = new mongoose.Schema({
  email : String,
  count : Number
});
var Spam = mongoose.model('spam',schema) ;
const register = (req,res,bcrypt,nodemailer,People)=>{
    const { email,name,password,gender } = req.body ;  //Destructuring
    if(!email||!name||!password||!gender)
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
       if(!name)
       {
        return res.status(400).json('Pls enter your name') ;
       }
    }
    People.find({'email':email},async(err,result)=>{
        if(err) throw err ;
        if(result.length){res.status(200).json('User with the same Email Already Exists');}
    else{
    Spam.find({'email':email},(err,r)=>{
      if(r.length){
         if(r[0].count>5) res.status(200).json('You have tried a lot of times to register , Pls wait for the mail from our side ')
         else{
          console.log(r[0].count+1)
          Spam.findOneAndUpdate({'email':email},
          {
            count: r[0].count+1
          },(err,re)=>{})
         }
      }
      else{
            new Spam({
              email : email,
              count:1
            }).save((err,result)=>{})
      }
    
    })
    const token = jwt.sign ({name, email, password, gender}, account_activate_api_key, {expiresIn : '30m'});
    let testAccount = await nodemailer.createTestAccount ();
  let transporter = nodemailer.createTransport ({
    service:'gmail',
    auth : {
      user : process.env.MAIL_USERNAME,
      pass : process.env.MAIL_PASSWORD 
    },
  })
    let mailOptions = {
        from : process.env.MAIL_USERNAME,
        to:email,
        subject: "Test Mail from Flirt Aid !",
        text : "Welcome to Flirt Aid community ",
        html : `
        <h2>Please click on the given link to activate your account</h2>
        <a href="${CLIENT_URL}/authentication/${token}">Click Here to verify</a>
        `
      }
      let info = transporter.sendMail (mailOptions, (error, info) => {
        if(error) {
          console.log (error);
          res.status(500).json ({yo : 'error'});
        }else {
          console.log ('Message sent : ' + info.response);
          res.status(200).json ('Mail sent successfully ! kindly check your Inbox or spam for your account verification');
        };
        return res.end();
      });
 }
})
}
const verify = (req,res,bcrypt,People)=>{
    const {token} = req.params;  //Destructuring
    var bio = '',number='',interests=[],hobbies='',dept='',Year='' ;
    if (token) {
        //decoding the jwt token received from the parameters of the authentication url
        jwt.verify (token, account_activate_api_key, function (err, decodedToken){
            if (err) {
                return res.render('index', { title: 'Session timed out', message: 'Incorrect or expired link , Pls register again with the same email id' })
            }
            const {name, email, password, gender} = decodedToken;
            People.find({'email':email},async(err,result)=>{
                if(err) throw err ;
                if(result.length){
                  return res.render('index', { title: 'Verified', message: 'You are verified , go and use our App' })
            }
            else{
                var arr = []
                const hash = bcrypt.hashSync(password) ;
             //If user has not completed his/her profile
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
                    else{
                      Spam.remove({'email':email},(err,re)=>{}) ;
                      return res.render('index', { title: 'Verified', message: 'Your Account is verified , Login to flirtaid' })
                       }
                })
            }
        }) ;
        })
    }
    else {
        return res.render('index', { title: 'Error', message: 'Something went wrong !' }) ;
    }
}
module.exports = {
  register: register,
  verify: verify
}
