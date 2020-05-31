require('dotenv').config()

const tmi = require("tmi.js");

// Todo: Get from server
const channels = [
    { name: 'raylanprime', id: '84768782' },
    { name: 'liahkurumi', id: '219093951' }
]

const channelsNames = channels.map(channel => channel.name)

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