# rose-chatbot
> Rose chatbot with NodeJS.

##### NOTE : This project need node version >= 6

This project uses

* ES6 ( Using babel-register )
* NodeJS ( version >= 6 )
* Tmi.js
* Socket.io-client
* Dotenv

### Get Started
Fire up your terminal
```sh
git clone https://github.com/raylansoares/rose-chatbot.git
cd rose-chatbot
npm install
cp .env.example .env
```

Open .env file and put you configs
* CHANNEL - The channel that the bot should connect
* USERNAME - The bot username
* PASSWORD - The bot oauth password (Generated on https://twitchapps.com/tmi/)
* SERVER_HOST - The rose-server host
* SERVER_PORT - The rose-server port

Start chatbot by typing
```sh
npm start
```