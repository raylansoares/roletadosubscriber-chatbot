require('dotenv').config()

import io from 'socket.io-client';

import * as configs from './configs';

import axios from 'axios';

const TwitchPS = require('twitchps');

import dayjs from 'dayjs'

const socket = io(`${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);

const client = configs.client;

let channels = []

const url = `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/api/users`;

const connect = () => {
    axios.get(url, { headers: { 
        'x-client-secret': process.env.CLIENT_SECRET
    } }).then((response) => {
        channels = []
        const channelsNames = []

        response.data.forEach(user => {
            const channelId = Buffer.from(user.code, 'base64').toString('ascii');
            const channelToken = user.access_token;

            const validToken = dayjs().isBefore(dayjs(user.expires));
            
            if (channelId !== process.env.CHANNEL && validToken) {
                updateTopics({ channel: channelId, token: channelToken });
            }
            const login = `#${user.login}`

            channels.push({ channel: login, code: user.code })
            
            channelsNames.push(login)
        })

        client.channels = channelsNames
        client.connect()
    }).catch()
}

const init_topics = [
    {
        topic: `channel-points-channel-v1.${process.env.CHANNEL}`,
        token: process.env.TOKEN
    }
];

const ps = new TwitchPS({
    init_topics: init_topics,
    reconnect: true,
    debug: true
});

const updateTopics = (data) => {
    try {
        ps.addTopic([{
            topic: `channel-points-channel-v1.${data.channel}`,
            token: data.token
        }]);
    } catch (e) {}
}

// PS error
ps.on('error', () => {})

// Get PS channel points event
ps.on('channel-points', (data) => {
  try {
    const username = data.redemption.user.login;
    const channelId = data.redemption.channel_id;
    const rewardTitle = data.redemption.reward.title;

    const code = Buffer.from(channelId, 'utf8');
    const channelCode = code.toString('base64')

    // Verify reward and and emit wheel event to server
    if (rewardTitle === 'Ganhe uma roleta do subscriber') {
        socket.emit('requestPrize', { code: channelCode, username: username});
    }
  } catch (e) {}
});

connect()

// Update PS on user login or refresh token (Event from server)
socket.on('pubSub', function (data) {
    if (data.channel !== process.env.CHANNEL) {
        updateTopics(data);
    }
});

// Connect to a new channel chat (Event from server)
socket.on('newChannel', function () {
    client.disconnect().then(() => {
        connect()
    })
});

// Event from Twitch chat
client.on("chat", async (channel, user, message, self) => {
    try {
        if (message === 'TestSubWheel' && user.username === channel.replace('#', '')) {
            setTimeout(() => {
                const channelObject = channels.find(findChannel => findChannel.channel === channel)
                if (!channelObject) return
                socket.emit('requestPrize', { code: channelObject.code, username: user['display-name']});
            }, 1000)
        }
    } catch (e) {}
    
});

const replace = (string, data) => {
    return string.replace('{user}', data.username).replace('{prize}', data.prizes[data.prizes.length - 1].name)
}

// Event from rose-server
socket.on('confirmPrize', function (data) {
    try {
        const channelObject = channels.find(findChannel => findChannel.code === data.code)
        if (!channelObject) return

        // Event to Twitch chat
        setTimeout(() => {
            client.action(channelObject.channel, replace(data.prizes[data.prizes.length - 1].message, data))
        }, 5000)

        const command = data.prizes[data.prizes.length - 1].command

        if(command) {
            if (command[0] === '@') return
            const delay = 6000 + ((data.prizes[data.prizes.length - 1].delay || 0) * 1000)
            setTimeout(() => {
                client.say(channelObject.channel, replace(command, data))
            }, delay)
        }
    } catch (e) {}
});

/* SUB EVENTS */

client.on("subscription", function (channel, username, methods, msg, userstate) {
    try {
        setTimeout(() => {
            const channelObject = channels.find(findChannel => findChannel.channel === channel)
            if (!channelObject) return
            socket.emit('requestPrize', { code: channelObject.code, username: username});
        }, 10000)
    } catch (e) {}
});
 
client.on("resub", function (channel, username, streakMonths, msg, userstate, methods) {
    try {
        setTimeout(() => {
            const channelObject = channels.find(findChannel => findChannel.channel === channel)
            if (!channelObject) return
            socket.emit('requestPrize', { code: channelObject.code, username: username});
        }, 10000)
    } catch (e) {}
});
  
client.on("subgift", function (channel, username, streakMonths, recipient, methods, userstate) {
    try {
        setTimeout(() => {
            const channelObject = channels.find(findChannel => findChannel.channel === channel)
            if (!channelObject) return
            socket.emit('requestPrize', { code: channelObject.code, username: recipient});
        }, 10000)
    } catch (e) {}
});
