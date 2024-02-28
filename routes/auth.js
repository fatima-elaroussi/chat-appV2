
const express =require('express');
const router = require ('express').Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require ('bcryptjs');
const verifyToken = require('./verifyToken');
const { registerValidation, loginValidation } = require(".//validation");
const TOKEN_SECRET = "KJHDSFBVKJLSV";
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.set('views','./views')
app.set('view engine', 'ejs');
app.use(express.static('public'));
const Joi = require('joi');
app.use(express.static(path.join(__dirname, 'public')));


router.use(cookieParser());


router.get('/register', (req, res) => {
  res.render('register')
});
router.get('/login', (req, res) => {
  res.render('login')
});


router.post('/register', async (req,res) =>{
    //validate the data before make a user
    function registerValidation(data) {
      const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(3).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
      });
    
      return schema.validate(data);
    }
const { error } = registerValidation
    
    //Checking if the user is already in the database
    const emailExist = await User.findOne({email: req.body.email}); 
    if(emailExist) return res.status(400).send('Email has already exists');
    
    //Hash the passwords
    const salt = await bcrypt.genSalt(10);
    const  hashedPassword = await bcrypt.hash(req.body.password, salt);
    //Create new user
    const user = new User ({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
   });
   try{
    const saveUser = await user.save();
    res.redirect('login')
   }catch (err) {
    res.status(400).send(err)
   }
});



router.post('/login', async (req, res) => {
  //validate the data before make a user
  const {error} = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //Checking if the email exists
  const user = await User.findOne({email: req.body.email}); 
  if (!user) return res.status(400).send('Email is not found');
  //PASSWORD IS CORRECT
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send('Invalid password');
  if(validPass){
  
  //Create a assign a token
  const token = jwt.sign({_id: user._id}, TOKEN_SECRET);
  res.cookie('jwtl', token  , {httpOnly : true} );
  res.header('auth-token', token)
  //.send(token);
  console.log(user)
  res.render('chat')
  //  res.status(201).send('connected')
}
});

router.post('/logout', verifyToken, (req, res) => {
  try {
      // Clear the token cookie or perform any other necessary actions to invalidate the token
      res.clearCookie('auth-token');
      res.status(200).send('Logged out successfully');
  } catch (error) {
      console.error('Error logging out:', error);
      res.status(500).send('Internal server error');
  }
});

router.get('/login', (req, res) =>{
 let token = req.cookies.jwtl;
 // Decode the JWT
jwt.verify(token, TOKEN_SECRET , (err, decoded) => {
  if (err) {
      // JWT verification failed
      console.error('JWT verification failed:', err);
  } else {
      // JWT decoded successfully
      console.log('Decoded JWT:', decoded);
      db
  }
});
})

// router.get('/chat',(req,res)=>{

//   res.render('chat');

  
// })


  //show all users
  // router.get("/all", (req, res) => {
  //   res.send(user);
  // });  

module.exports = router;