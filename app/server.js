require('dotenv').config()

import io from 'socket.io-client';

import * as configs from './configs';

const socket = io(`${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);

const channel = `#${configs.channel}`;
const client = configs.client;

client.connect()

// Event from Twitch chat
client.on("chat", async (channel, user, message, self) => {
    if (message === 'sub') {
        // Event to rose-server
        socket.emit('requestPrize', user['display-name'])
    }
});

// Event from rose-server
socket.on('confirmPrize', function (data) {
    // Event to Twitch chat
    client.action(channel, `${data.user} gets ${data.prize}!`)
});