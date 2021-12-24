const { InstantConnectProxy } = require('prismarine-proxy')
const netlog = require('prismarine-inspector')
const { setTimeout: wait } = require('timers/promises')

it('works with prismarine-proxy', async () => {
  const proxy = new InstantConnectProxy({
    serverOptions: { // options for the local server shown to the vanilla client
      version: '1.8.9',
      host: 'localhost',
      port: 25560
    },
    clientOptions: { // options for the client that will connect to the proxied server
      version: '1.8.9',
      host: '127.0.0.1',
      port: 25565,
      username: 'proxy',
      password: ''
    },
    loginHandler: (client) => console.log('client login', client)
  })
  netlog(proxy)

  await wait(300)
  globalThis._mcnetLogServer.close()
  proxy.server.close()
})
