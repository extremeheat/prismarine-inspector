
const bp = require('bedrock-protocol')

module.exports = ({ remoteServerHost, remoteServerPort, localBindPort, username, password }, con) => {
  const proxy = new bp.Relay({
    offline: true,
    host: '0.0.0.0',
    port: Number(localBindPort) || 19131,
    destination: {
      host: remoteServerHost || '127.0.0.1',
      port: Number(remoteServerPort) || 19132
    }
  })

  proxy.listen()

  proxy.on('connect', player => {
    con.setInitialTime(Date.now())

    player.on('login', (client) => {
      console.log('login', client)
    })
  
    player.on('clientbound', ({ name, params }, { metadata: { size } }) => {
      con.receiveClientbound(name, params, size)
    })
  
    player.on('serverbound', ({ name, params }, { metadata: { size } }) => {
      con.receiveServerbound(name, params, size)
    })
  })

  return proxy
}