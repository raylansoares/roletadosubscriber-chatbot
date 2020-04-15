import io from 'socket.io-client';

import * as constants from './constants';
import * as configs from './configs';

const socket = io(`${constants.SERVER_HOST}:${constants.SERVER_PORT}`);

const channel = `#${configs.channel}`;
const client = configs.client;

client.connect()

client.on("chat", async (channel, user, message, self) => {
    socket.emit('client-chat', message) // send message to rose-server
});

socket.on('server-confirm', function (data) { // get confirmation from rose-server
    client.action(channel, `confirmed message: ${data}`) // send confirmation message on twitch chat
});
