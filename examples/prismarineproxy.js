const { InstantConnectProxy } = require('prismarine-proxy')
const netlog = require('mc-netlog')

const proxy = new InstantConnectProxy({
  serverOptions: {
    host: 'localhost',
    port: 25560,
    version: '1.8.9'
  },
  clientOptions: {
    version: '1.8.9',
    host: '127.0.0.1',
    port: 25565,
    username: 'proxy',
    password: ''
  },
  loginHandler: (client) => console.log('client login', client)
})

netlog(proxy).then(() => console.log('Started'))
