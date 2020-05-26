require('dotenv').config()

import io from 'socket.io-client';

import * as configs from './configs';

const socket = io(`${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);

const channel = `#${configs.channel}`;
const client = configs.client;

client.connect()

// Event from Twitch chat
// client.on("chat", async (channel, user, message, self) => {
//     if (message === 'TestSubWheel') {
//         setTimeout(() => {
//             socket.emit('requestPrize', user['display-name'])
//         }, 5000)
//     }
// });

// Event from rose-server
socket.on('confirmPrize', function (data) {

    // Event to Twitch chat
    setTimeout(() => {
        client.action(channel, `${data.username} ganhou ${data.prizes[data.prizes.length - 1]}!`)
    }, 5000)

    // Auto timeout user
    if (data.prizes[data.prizes.length - 1] === '10 minutos de timeout') {
        setTimeout(() => {
            client.say(channel, `/timeout ${data.username} 600`)
        }, 6000)
    }

    // Auto add give points to user
    if (data.prizes[data.prizes.length - 1] === '500 rosecoins') {
        setTimeout(() => {
            client.say(channel, `!givepoints ${data.username} 500`)
        }, 6000)
    }

    // Auto ad
    if (data.prizes[data.prizes.length - 1] === 'Anúncio de graça') {
        setTimeout(() => {
            client.say(channel, `/commercial 30`)
        }, 6000)
    }
});

/* SUB EVENTS */

client.on("subscription", function (channel, username, methods, msg, userstate) {
    setTimeout(() => {
        socket.emit('requestPrize', username)
    }, 10000)
});
 
client.on("resub", function (channel, username, streakMonths, msg, userstate, methods) {
    setTimeout(() => {
        socket.emit('requestPrize', username)
    }, 10000)
});
  
client.on("subgift", function (channel, username, streakMonths, recipient, methods, userstate) {
    setTimeout(() => {
        socket.emit('requestPrize', recipient)
    }, 10000)
});
