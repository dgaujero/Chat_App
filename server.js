// path module 
const path = require('path')

//bring in http module
//used by express under the hood
const http = require('http')

// bring in express
const express = require('express');

//bring in socket.io
const socketio = require('socket.io')

// bring in moment to format time
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
const { format } = require('path');

// initialize var app and set that to express; we use app to call .listen() to run a server that takes in a port number
const app = express();

// createServer used by express 
// passing function our app 
const server = http.createServer(app)

// pass socket.io our sever
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

// botname
const botName = 'DeezChord Bot'

// run when a client connects
// '.on' will listen for an event; listen for connection
// take in an arrow function with socket as a param
// whenever client connects, it should console.log 
// emit message to client from server
io.on('connection', socket => {
    //
    socket.on('joinRoom', ({ username, room}) => {
        //
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)


        // to .emit by itself is for single client
        // welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to DeezChord!'));
    
        // broadcast when a user connects
        // difference between broadcast.emit and .emit is that
        // this will emit to everyone but the user that's connecting
        // we don't need to emit to the user that's connecting that it's connecting
        socket.broadcast
        .to(user.room)
        .emit('message', 
        formatMessage(botName,`${user.username} has joined the chat`));

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    })

    // listen for chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        // want to send to everyone so use io.emit
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            // 
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`));

            //send users and room info
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }

    });

})

// look to see if theres an environment called port or use 3000
const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))