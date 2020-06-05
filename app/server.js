require('dotenv').config()

import io from 'socket.io-client';

import * as configs from './configs';

import axios from 'axios';

const socket = io(`${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);

const client = configs.client;

const url = `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/api/users`;

const connect = () => {
    axios.get(url, { headers: { 
        'x-client-secret': process.env.CLIENT_SECRET
    } }).then((response) => {
        const channels = response.data.map(user => `#${user.login}`)
        client.channels = channels
        client.connect()
    }).catch()
}

connect()

socket.on('newChannel', function () {
    client.disconnect().then(() => {
        connect()
    })
});

// Event from Twitch chat
client.on("chat", async (channel, user, message, self) => {
    if (message === 'TestSubWheel') {
        setTimeout(() => {
            const channelObject = configs.channels.find(findChannel => findChannel.channel === channel.replace('#', ''))
            if (!channelObject) return
            socket.emit('requestPrize', { code: channelObject.code, username: user['display-name']});
        }, 1000)
    }
});

// Event from rose-server
socket.on('confirmPrize', function (data) {

    const channelObject = configs.channels.find(findChannel => findChannel.code === data.code)
    if (!channelObject) return

    // Event to Twitch chat
    setTimeout(() => {
        client.action(`#${channelObject.channel}`, `${data.username} ganhou ${data.prizes[data.prizes.length - 1]}!`)
    }, 5000)

    // Auto timeout user
    if (data.prizes[data.prizes.length - 1] === '10 minutos de timeout') {
        setTimeout(() => {
            client.say(`#${channelObject.channel}`, `/timeout ${data.username} 600`)
        }, 15000)
    }

    // Auto add give points to user
    if (data.prizes[data.prizes.length - 1] === '500 rosecoins') {
        setTimeout(() => {
            client.say(`#${channelObject.channel}`, `!givepoints ${data.username} 500`)
        }, 6000)
    }

    // Auto ad
    if (data.prizes[data.prizes.length - 1] === 'Anúncio de graça') {
        setTimeout(() => {
            client.say(`#${channelObject.channel}`, `/commercial 60`)
        }, 15000)
    }
});

/* SUB EVENTS */

client.on("subscription", function (channel, username, methods, msg, userstate) {
    setTimeout(() => {
        const channelObject = configs.channels.find(findChannel => findChannel.channel === channel.replace('#', ''))
        if (!channelObject) return
        socket.emit('requestPrize', { code: channelObject.code, username: username});
    }, 10000)
});
 
client.on("resub", function (channel, username, streakMonths, msg, userstate, methods) {
    setTimeout(() => {
        const channelObject = configs.channels.find(findChannel => findChannel.channel === channel.replace('#', ''))
        if (!channelObject) return
        socket.emit('requestPrize', { code: channelObject.code, username: username});
    }, 10000)
});
  
client.on("subgift", function (channel, username, streakMonths, recipient, methods, userstate) {
    setTimeout(() => {
        const channelObject = configs.channels.find(findChannel => findChannel.channel === channel.replace('#', ''))
        if (!channelObject) return
        socket.emit('requestPrize', { code: channelObject.code, username: recipient});
    }, 10000)
});
