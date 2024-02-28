const express = require('express')
const app = express()
const http = require('http').createServer(app)
const dotenv = require('dotenv');
dotenv.config();
const authRoute = require('./routes/auth');
const postRoute = require ('./routes/posts');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose =require('mongoose');
const PORT = process.env.PORT || 3000


app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));



mongoose.connect('mongodb://localhost:27017/chat-app').then(()=>{

console.log('data base connected')

}).catch(err=>{
    console.log(err)
})

app.use(express.json())
 

app.use('/auth', authRoute);
app.use('/api/posts', postRoute);


http.listen(3000, () => {
    console.log(`Listening on port 3000`)
})

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.render('login')

})

// Socket 
const io = require('socket.io')(http)

io.on('connection', (socket) => {
    console.log('Connected...')
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg)
    })

})