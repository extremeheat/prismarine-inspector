const mineflayer = require('mineflayer')
const netlog = require('prismarine-inspector')

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: 'proxy',
  password: '',
  version: '1.8.9'
})

netlog(bot)
