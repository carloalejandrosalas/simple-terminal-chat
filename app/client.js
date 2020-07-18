const net = require('net')
const colors = require('colors')
const Input = require('./tools/input')

const input = new Input();

let client = null

async function initChat () {
    const nickname = await input.question('Set your nickname: ');

    client = net.connect({port: 8000 }, function() {
        console.log(colors.green('---- Connection successful ----'));
        
        const initData = {
            type: 'SET_NICK',
            nickname: nickname,
            itsMe: true
        };

        client.write(JSON.stringify(initData))


        setTimeout(askMessage, 5000)

    })
    .on('data', (result) => {
        try {

            const data = result.toString();
            
            const frag = data.split('}{');
            
            // console.log({data, frag, union: frag.join('},{')});
            if(frag.length > 1) {
                // Si se concatena los strings, los separamos y depues los unimos.
                const payload = JSON.parse("["+frag.join('},{')+"]  ");

                payload.forEach((item) => handleData(item));

            } else {
                
                const payload = JSON.parse(data.toString())
        
                handleData(payload)
            }

            askMessage()
        } catch(e) {
            console.error(e);
        }
    })
    .on('end', () => {
        console.warn('disconnected from server');
    })
}

function handleData(payload) {

    if (payload.itsMe) return;

    switch(payload.type) {
        case 'WELCOME_MESSAGE':
            console.log(colors.magenta(payload.message)+"!")
            break;
        case 'USER_ENTER':
            console.log(`@${colors[payload.userColor](payload.nickname)} enter in the chat`)
            break;
        case 'NEW_MESSAGE':
            console.log(`@${colors[payload.userColor](payload.nickname)} : ${payload.message}`)
            break;
        case 'USER_LEAVE':
            console.log(`@${colors[payload.userColor](payload.nickname)} leaves the chat`)
    }

    askMessage()
}

async function askMessage() {
    const message = await input.question('message: ')

    client.write(JSON.stringify({
        type: 'MESSAGE',
        message,
        itsMe: true
    }))

    askMessage();
}

initChat();