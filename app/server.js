import io from 'socket.io-client';

import * as configs from './configs';

const socket = io(`${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);

const channel = `#${configs.channel}`;
const client = configs.client;

client.connect()

client.on("chat", async (channel, user, message, self) => {
    if (message === 'sub') {
        socket.emit('requestPrize', user['display-name'])
    }
});

socket.on('confirmPrize', function (data) {
    client.action(channel, `${data.user} gets ${data.prize}!`)
});