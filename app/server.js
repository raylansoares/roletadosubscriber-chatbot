require('dotenv').config()

import io from 'socket.io-client';

import * as configs from './configs';

const socket = io(`${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);

const client = configs.client;

client.connect()

socket.on('create', function () {
    const rooms = process.env.ROOMS.split(',')
    for (const room of rooms) socket.join(room)
});

// Event from Twitch chat
client.on("chat", async (channel, user, message, self) => {
    if (message === 'TestSubWheel') {
        setTimeout(() => {
            const channelObject = configs.channels.find(findChannel => findChannel.name === channel.replace('#', ''))
            if (!channelObject) return
            socket.emit('requestPrize', { room: channelObject.id, username: user['display-name']});
        }, 1000)
    }
});

// Event from rose-server
socket.on('confirmPrize', function (data) {

    // Event to Twitch chat
    setTimeout(() => {
        const channelObject = configs.channels.find(findChannel => findChannel.id === data.room)
        if (!channelObject) return
        client.action(`#${channelObject.name}`, `${data.username} ganhou ${data.prizes[data.prizes.length - 1]}!`)
    }, 5000)

    // Auto timeout user
    if (data.prizes[data.prizes.length - 1] === '10 minutos de timeout') {
        setTimeout(() => {
            const channelObject = configs.channels.find(findChannel => findChannel.id === data.room)
            if (!channelObject) return
            client.say(`#${channelObject.name}`, `/timeout ${data.username} 600`)
        }, 15000)
    }

    // Auto add give points to user
    if (data.prizes[data.prizes.length - 1] === '500 rosecoins') {
        setTimeout(() => {
            const channelObject = configs.channels.find(findChannel => findChannel.id === data.room)
            if (!channelObject) return
            client.say(`#${channelObject.name}`, `!givepoints ${data.username} 500`)
        }, 6000)
    }

    // Auto ad
    if (data.prizes[data.prizes.length - 1] === 'Anúncio de graça') {
        setTimeout(() => {
            const channelObject = configs.channels.find(findChannel => findChannel.id === data.room)
            if (!channelObject) return
            client.say(`#${channelObject.name}`, `/commercial 60`)
        }, 15000)
    }
});

/* SUB EVENTS */

client.on("subscription", function (channel, username, methods, msg, userstate) {
    setTimeout(() => {
        const channelObject = configs.channels.find(findChannel => findChannel.name === channel.replace('#', ''))
        if (!channelObject) return
        socket.emit('requestPrize', { room: channelObject.id, username: username});
    }, 10000)
});
 
client.on("resub", function (channel, username, streakMonths, msg, userstate, methods) {
    setTimeout(() => {
        const channelObject = configs.channels.find(findChannel => findChannel.name === channel.replace('#', ''))
        if (!channelObject) return
        socket.emit('requestPrize', { room: channelObject.id, username: username});
    }, 10000)
});
  
client.on("subgift", function (channel, username, streakMonths, recipient, methods, userstate) {
    setTimeout(() => {
        const channelObject = configs.channels.find(findChannel => findChannel.name === channel.replace('#', ''))
        if (!channelObject) return
        socket.emit('requestPrize', { room: channelObject.id, username: recipient});
    }, 10000)
});
