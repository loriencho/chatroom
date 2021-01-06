const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html', __dirname + '/main.js');
});

users = [];

io.on('connection', (socket) => {
    let d = new Date();
    
    const userid = `${d.getHours()}${d.getMinutes()}${d.getSeconds()}`;

    io.emit('a user connected');
    socket.on('send chat message', (data) =>{
        console.log(data);
        io.emit('receive chat message', data);
    });
    socket.on('add user', (username) =>{
        if(users.indexOf(username) > -1){
            socket.emit('user exists', username);
        }
        else{
            console.log("User added " + username);
            users.push(username);
            socket.emit('user set', username);
        }
    });
    socket.on('disconnect', () =>{
        console.log('a user disconnected');
    }    
    );
});

http.listen(3000, () => {
    console.log('listening on *:3000');
})