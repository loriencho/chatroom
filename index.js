const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html', __dirname + '/main.js');
});

let users = {};
let usernames = [];
let usersTyping = [];

io.on('connection', (socket) => {
    socket.emit('receive user list', {userlist:usernames, userdata:users})
    socket.on('send chat message', (data) =>{
        io.emit('receive chat message', {user: data.user, msg:data.msg, color:users[data.user].color});
    });
    socket.on('add user', (username) =>{
        
        if(usernames.indexOf(username) > -1){
            socket.emit('user exists', username);
        }
        else{
            socket.username = username;
            usernames.push(username);
            users[username] = {color: Math.floor(Math.random()*357).toString()};
            socket.emit('user set', username);
            io.emit('user added', {user:socket.username, color:users[username].color})
        }
    });
    socket.on('disconnect', () =>{
        if (usersTyping.indexOf(socket.username)!= -1) {
            usersTyping.splice(usersTyping.indexOf(socket.username), 1); 
            socket.broadcast.emit('typing', usersTyping);
        }
        console.log(socket.username + ' disconnected');
        io.emit('receive chat message', {user: socket.username, msg:"Left chat.", color:users[socket.username].color});
        usernames.splice(usernames.indexOf(socket.username), 1);
        io.emit('user removed', socket.username);
        delete users[socket.username];
    }    
    );
    
    socket.on('typing', (data) => {
        if (usersTyping.indexOf(data.name) == -1) {
            if (data.isTyping) {
                usersTyping.push(data.name);
            }
                         
        } else {
            if (!data.isTyping) {
                usersTyping.splice(usersTyping.indexOf(data.name), 1); 
            }
        }
        
        socket.broadcast.emit('typing', usersTyping);
      })
});




http.listen(process.env.PORT || 3000, () => {
    console.log('listening on *:3000');
})


