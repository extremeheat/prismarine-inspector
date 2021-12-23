// slightly modified https://github.com/PrismarineJS/prismarine-proxy/blob/master/src/instant_connect_proxy.js to make it work here
const EventEmitter = require('events')
const { createServer, createClient } = require('minecraft-protocol')
const mcDataLoader = require('minecraft-data')
const PLAY_STATE = 'play'

class InstantConnectProxy extends EventEmitter {
  constructor (options) {
    super()
    this.options = options
    this.toServerClients = new Map()
    this.server = createServer({
      'online-mode': false,
      keepAlive: false,
      ...this.options.serverOptions
    })

    this.server.on('login', client => this.onLogin(client))
  }

  onLogin (toClient) {
    // until the proxyClient logs in, lets send a login packet
    const mcData = mcDataLoader(toClient.version)
    // const mcVersion = mcData.version.minecraftVersion
    // const ver = verMap[mcVersion] ?? mcVersion
    toClient.write('login', { ...(mcData.loginPacket || { entityId: 0, gameMode: 0, dimension: 0, difficulty: 0, maxPlayers: 20, levelType: 'default', reducedDebugInfo: false, enableRespawnScreen: true }), entityId: toClient.id })

    const toServer = createClient({
      ...this.options.clientOptions,
      keepAlive: false,
      ...this.options.loginHandler(toClient)
    })

    this.toServerClients.set(toClient.id, toServer)

    toServer.on('login', (data) => {
      if (!this.clientIsOnline(toClient)) return
      this.emit('start', toClient, toServer)
      // https://github.com/VelocityPowered/Velocity/blob/aa210b3544556c46776976cddc45deb4ace9bb68/proxy/src/main/java/com/velocitypowered/proxy/connection/client/ClientPlaySessionHandler.java#L437
      let dimension = data.dimension
      if (mcData.isOlderThan('1.16')) {
        dimension = data.dimension === 0 ? -1 : 0
      }
      toClient.write('respawn', { ...data, dimension })
      toClient.write('respawn', data)
    })

    toClient.on('packet', (data, meta) => {
      if (!this.clientIsOnline(toClient)) return
      if (toServer.state === PLAY_STATE && meta.state === PLAY_STATE) {
        this.emit('outgoing', data, meta, toClient, toServer)
      }
    })

    toServer.on('packet', (data, meta) => {
      if (!this.clientIsOnline(toClient)) return
      if (meta.name === 'disconnect') {
        toClient.write('kick_disconnect', data)
      }
      if (meta.state === PLAY_STATE && toClient.state === PLAY_STATE) {
        if (meta.name === 'set_compression') {
          toClient.compressionThreshold = data.threshold // Set compression
          return
        }
        this.emit('incoming', data, meta, toClient, toServer)
      }
    })
    toClient.once('end', () => {
      this.emit('end', toServer.username)
      this.endClient(toClient)
    })
  }

  endClient (client) {
    this.toServerClients.get(client.id)?.end()
    this.toServerClients.delete(client.id)
  }

  clientIsOnline (client) {
    return this.server?.clients[client.id] !== undefined
  }
}

module.exports = ({remoteServerHost, remoteServerPort, localBindPort, username, password}, con) => {
  console.log('remote', remoteServerHost, remoteServerPort, localBindPort, username, password)
  const proxy = new InstantConnectProxy({
    serverOptions: {
      host: 'localhost',
      port: localBindPort,
      version: '1.8.9'
    },
    clientOptions: {
      version: '1.8.9',
      host: remoteServerHost,
      port: remoteServerPort,
      username: username || 'proxy',
      password: password || '',
    },
    loginHandler: (client) => console.log('login', client)
  })
  con.setInitialTime(Date.now())

  // clientbound
  proxy.on('incoming', (data, meta, toClient, toServer) => {
    toClient.write(meta.name, data) // otherwise send the packet to the client
    con.receiveClientbound(meta.name, data, meta.size, meta.state)
  })

  // serverbound
  proxy.on('outgoing', (data, meta, toClient, toServer) => {
    toServer.write(meta.name, data) // otherwise send the packet to the client
    con.receiveServerbound(meta.name, data, meta.size, meta.state)
  })
}