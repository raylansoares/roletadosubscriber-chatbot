require('dotenv').config()

import io from 'socket.io-client';

import * as configs from './configs';

const socket = io(`${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);

const channel = `#${configs.channel}`;
const client = configs.client;

client.connect()

// Event from Twitch chat
// client.on("chat", async (channel, user, message, self) => {
    // console.log(channel, user, message, self)
    // if (message === 'TestSubWheel') {
        // Event to rose-server
        // socket.emit('requestPrize', user['display-name'])
    // }
// });

// Event from rose-server
socket.on('confirmPrize', function (data) {

    // Auto timeout user
    if (data.prizes[data.prizes.length - 1] === '10 minutos de timeout') {
        client.say(channel, `/timeout ${data.username} 600`)
    }

    // Auto add give points to user
    if (data.prizes[data.prizes.length - 1] === '500 rosecoins') {
        client.say(channel, `!givepoints ${data.username} 500`)
    }

    // Event to Twitch chat
    client.action(channel, `${data.username} ganhou ${data.prizes[data.prizes.length - 1]}!`)
});

/* SUB EVENTS */

client.on("subscription", function (channel, username, methods, msg, userstate) {
    socket.emit('requestPrize', username)
});
 
client.on("resub", function (channel, username, streakMonths, msg, userstate, methods) {
    socket.emit('requestPrize', username)
});
  
client.on("subgift", function (channel, username, streakMonths, recipient, methods, userstate) {
    socket.emit('requestPrize', recipient)
});
