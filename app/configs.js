require('dotenv').config()

const tmi = require("tmi.js");

const channel = process.env.CHANNEL

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
    channels: [channel]
};

const client = new tmi.client(config);

export {
    channel,
    client
}