require('dotenv').config()

const tmi = require("tmi.js");

// Todo: Get from server
const channels = [
    { channel: 'raylanprime', code: 'ODQ3Njg3ODI=' },
    { channel: 'liahkurumi', code: 'MjE5MDkzOTUx' }
]

const channelsNames = channels.map(channel => channel.channel)

const config = {
    options: {
        debug: true
    },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
    },
    channels: channelsNames
};

const client = new tmi.client(config);

export {
    channels,
    client
}