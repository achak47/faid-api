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
       if(!gender)
       {
        return res.status(400).json('Pls mention your gender') ;
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
          //res.status(200).json('Updated') ;
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
  console.log(process.env.MAIL_USERNAME ) ;
  let transporter = nodemailer.createTransport({
    host: "smtp.yandex.ru",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'admin@flirtaid.social', // generated ethereal user
      pass: 'Bekarapp@123', // generated ethereal password
    },
  });
    let mailOptions = {
        from : process.env.MAIL_USERNAME,
        to:email,
        subject: "Verification Mail from Flirt Aid !",
        text : "Welcome to Flirt Aid community ",
        html : `
        <h2>Please click on the given link to activate your account</h2>
        <a href="${CLIENT_URL}/authentication/${token}">Click Here to verify</a>
        <p>Pls do it under 30 min</p>
        <p>If the above link is not working then browse to ${CLIENT_URL}/authentication/${token} </p>
        <p>IF THE LINK IS NOT ACTIVE OR YOU CANNOT CLICK THE LINK FROM HERE , THEN COPY THE LINK AND PASTE IT ON YOUR BROWSER ( eg :- GOOGLE CHROME)</p>
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
const verify = (req,res,bcrypt,People,Index)=>{
    const {token} = req.params;  //Destructuring
    var bio = '',interests=[],hobbies='',dept='',Year='' ;
    if (token) {
        //decoding the jwt token received from the parameters of the authentication url
        jwt.verify (token, account_activate_api_key, function (err, decodedToken){
            if (err) {
                return res.render('index', { title: 'Session timed out', message: 'Session Expired ! Pls login to Flirtaid or if you are not registered then register again',
                    Link:'www.flirtaid.social' })
            }
            const {name, email, password, gender} = decodedToken;
            People.find({'email':email},async(err,result)=>{
                if(err) throw err ;
                if(result.length){
                  return res.render('index', { title: 'Verified', message: 'You are verified , go and use our App',
                    Link:'www.flirtaid.social' })
            }
            else{
                var arr = []
                const hash = bcrypt.hashSync(password) ;
             //If user has not completed his/her profile
                new People({
                    name : name,
                    email: email,
                    bio:bio,
                    password: hash,
                    hobbies:hobbies,
                    passion:interests,
                    ihash:arr,
                    dept:dept,
                    Year:Year,
                    gender:gender,
                    isVerified:false,
                    age:0 
                }).save((err,result)=>{
                    if(err) throw err ;
                    else{
                      Spam.remove({'email':email}) ;
                      new Index({
                        userid: result._id ,
                        index: 0,
                        reqlist: [],
                        emailuser: email
                      }).save((err,ree)=>{console.log(err)})
                      return res.render('index', { title: 'Verified', message: 'Your Account is verified , Login to flirtaid',
                      Link:'www.flirtaid.social' })
                       }
                })
            }
        }) ;
        })
    }
    else {
        return res.render('index', { title: 'Error', message: 'Something went wrong !', Link:'' }) ;
    }
}
module.exports = {
  register: register,
  verify: verify
}
