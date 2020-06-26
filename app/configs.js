require('dotenv').config()

const tmi = require("tmi.js");

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
    channels: []
};

const client = new tmi.client(config);

export {
    client
}