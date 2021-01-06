const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html', __dirname + '/main.js');
});

let users = {};
let usernames = [];

io.on('connection', (socket) => {
    let d = new Date();

    io.emit('a user connected');
    socket.on('send chat message', (data) =>{
        console.log(data);
        io.emit('receive chat message', {user: data.user, msg:data.msg, color:users[data.user].color});
    });
    socket.on('add user', (username) =>{
        
        if(usernames.indexOf(username) > -1){
            socket.emit('user exists', username);
        }
        else{
            usernames.push(username);
            users[username] = {color: Math.floor(Math.random()*16777215).toString(16)};
            console.log(username, ' has connected');
            socket.emit('user set', username);
        }
    });
    socket.on('disconnect', () =>{
        console.log('a user disconnected');
    }    
    );
    
    socket.on('typing', (data) => {
        socket.broadcast.emit("typing", data);
      })
});




http.listen(process.env.PORT || 3000, () => {
    console.log('listening on *:3000');
})

