import * as configs from './configs'
import axios from 'axios'
import io from 'socket.io-client'

require('dotenv').config()

const socket = io(`${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`)

const client = configs.client

let channels = []

const url = `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/api/users`
const params = '?active=true'

const connect = () => {
  axios.get(url + params, {
    headers: {
      'x-client-secret': process.env.CLIENT_SECRET
    }
  }).then((response) => {
    channels = []
    const channelsNames = []

    response.data.forEach(user => {
      const login = `#${user.login}`
      channels.push({ channel: login, code: user.code })
      channelsNames.push(login)
    })

    client.channels = channelsNames
    client.connect()
  }).catch()
}

connect()

// Function to render a string with placeholder - {user} and {prize}
const replace = (string, data) => {
  return string.replace('{user}', data.username)
    .replace('{prize}', data.prizes[data.prizes.length - 1].name)
}

/* SOCKET EVENTS */

// Connect to channel (Event from server)
socket.on('joinChannel', (data) => {
  const findChannel = channels.find(
    channel => channel.code === data.code
  )

  if (findChannel) return

  const login = `#${data.channel}`
  channels.push({ channel: login, code: data.code })
  client.join(login)
})

// Event from server
socket.on('confirmPrize', (data) => {
  try {
    const channelObject = channels.find(
      findChannel => findChannel.code === data.code
    )

    if (!channelObject) return

    const lastPrize = data.prizes[data.prizes.length - 1]

    // Event to Twitch chat
    setTimeout(() => {
      const message = '-> ' + replace(lastPrize.message, data)
      client.action(channelObject.channel, message)
    }, 5000)

    const command = lastPrize.command

    if (command && command[0] !== '@') {
      const delay = 6000 + ((lastPrize.delay || 0) * 1000)
      setTimeout(() => {
        client.say(channelObject.channel, replace(command, data))
      }, delay)
    }
  } catch (e) {}
})

/* COMMANDS EVENTS */

socket.on('executeCommand', (data) => {
  try {
    const channelObject = channels.find(
      findChannel => findChannel.code === data.code
    )

    if (!channelObject || !data.action || !data.input) return

    const target = data.input.split(' ')[0].replace('@', '')

    client.say(channelObject.channel, `/${data.action} ${target} ${data.time || ''}`)
  } catch (e) {}
})

/* SUB EVENTS */

client.on('subscription', (channel, username, methods, msg, userstate) => {
  try {
    setTimeout(() => {
      const channelObject = channels.find(
        findChannel => findChannel.channel === channel
      )

      if (!channelObject) return

      socket.emit('requestPrize', {
        code: channelObject.code,
        username: username,
        origin: 'Sub',
        quantity: 1,
        message: null,
        plan: userstate['msg-param-sub-plan']
      })
    }, 10000)
  } catch (e) {}
})

client.on('resub', (channel, username, streakMonths, msg, userstate, methods) => {
  try {
    setTimeout(() => {
      const channelObject = channels.find(
        findChannel => findChannel.channel === channel
      )

      if (!channelObject) return

      socket.emit('requestPrize', {
        code: channelObject.code,
        username: username,
        origin: 'Resub',
        quantity: parseInt(userstate['msg-param-cumulative-months'])
          ? parseInt(userstate['msg-param-cumulative-months'])
          : 1,
        message: msg,
        plan: userstate['msg-param-sub-plan']
      })
    }, 10000)
  } catch (e) {}
})

client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
  try {
    setTimeout(() => {
      const channelObject = channels.find(
        findChannel => findChannel.channel === channel
      )

      if (!channelObject) return

      socket.emit('requestPrize', {
        code: channelObject.code,
        username: recipient,
        origin: 'SubGift',
        quantity: parseInt(userstate['msg-param-months'])
          ? parseInt(userstate['msg-param-months'])
          : 1,
        message: null,
        plan: userstate['msg-param-sub-plan']
      })
    }, 10000)
  } catch (e) {}
})

client.on("chat", async (channel, user, message, self) => {
  try {
    const isMod = user.mod
    const isBroadcaster = channel === `#${user.username}`
    const isAdmin = user.username === process.env.ADMIN
    const isAdValidMesasge = message.split(' ')[0] === '!ad' && ['1','2','3'].includes(message.split(' ')[1])
    const isValidWheelMessage = message === '!t'

    if ((isMod || isBroadcaster || isAdmin) && (isAdValidMesasge)) {
      client.say(channel, `/commercial ${message.split(' ')[1] * 60}`)
      return
    }

    if (isAdmin && isValidWheelMessage) {
      const channelObject = channels.find(
        findChannel => findChannel.channel === channel
      )

      if (!channelObject) return

      socket.emit('requestPrize', {
        code: channelObject.code,
        username: user.username,
        origin: 'Admin',
        quantity: null,
        message: null,
        plan: null
      })
    }
  } catch (e) {}
});
