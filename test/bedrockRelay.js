const bp = require('bedrock-protocol')
const netlog = require('mc-netlog')
const { setTimeout: wait } = require('timers/promises')

it('works with bedrock relay', async () => {
  const proxy = new bp.Relay({
    offline: true,
    host: '0.0.0.0',
    port: 19131,
    destination: {
      host: '127.0.0.1',
      port: 19130
    }
  })

  await wait(300)
  proxy.listen()
  netlog(proxy, { port: 9223 }).then(() => console.log('Started'))
  await wait(300)
  proxy.close()
  globalThis._mcnetLogServer.close()
})
