const net = require('net')

const sockets = []

const server = net.createServer((socket) => {

    try {
        socket.name = socket.remoteAddress + socket.remotePort
        socket.userColor = chooseColor()
        
        socket.write(JSON.stringify({
            type: 'WELCOME_MESSAGE',
            message : 'Welcome to the chat'
        }))
        
        socket.on('data', (data) => {
            console.log('se ha recibido un nuevo mensaje')
    
            // console.log(socket.nickname)

            handleData(JSON.parse(data.toString()), socket)
        })
    
        socket.pipe(socket)
    
        sockets.push(socket);

        socket.on('close', () => {
            console.log('un usuario salio')
            
            handleData({
                type: 'USER_LEAVE'
            }, socket)

            const idx = sockets.findIndex( (item) => {
                return socket === item
            })

            sockets.splice(idx, 1);
            socket.destroy()
        })

    } catch(e) {
        console.log(e);
    }


}).on('error', (err) => {
    console.error(err)
})


function sendMessage(message, sender) {


    sockets.forEach(socket => {
        if(sender.nickname !== socket.nickname) {
            console.log(socket.nickname)
            socket.write(message)
        }
    })
}

function handleData(data, sender) {
    let payload = {};

    switch (data.type) {
        case 'SET_NICK':
            sender.nickname = data.nickname
            payload = {
                type: 'USER_ENTER',
                nickname: sender.nickname,
                userColor: sender.userColor
            }
            sendMessage(JSON.stringify(payload), sender)
            break;
        case 'MESSAGE':
             payload = {
                type: 'NEW_MESSAGE',
                message: data.message,
                nickname: sender.nickname,
                userColor: sender.userColor
            }
            sendMessage(JSON.stringify(payload), sender)
            break;
        case 'USER_LEAVE':
            payload = {
                type: 'USER_LEAVE',
                nickname: sender.nickname,
                userColor: sender.userColor
            }
            sendMessage(JSON.stringify(payload), sender)
            break;
    }

    
}

function chooseColor() {
    const min = 0
    const max = 8 

    const colors = [
        'red',
        'green',
        'yellow',
        'blue',
        'magenta',
        'cyan',
        'white',
        'gray',
        'grey'
    ];

    const  idxColor = Math.floor(Math.random() * (max - min) ) + min;
      
    return colors[idxColor]
}

server.listen(8000, () => {
    console.log('opened server on', server.address());
});