const debug = require('debug')('mc-netlog')
const { EventEmitter } = require('ws')
const server = require('./server/server')

class IOQueue extends EventEmitter {
  constructor () {
    super()
    this.cbQ = []
    this.sbQ = []
    this.frontend = null
    this.it = Date.now()
  }

  setFrontend (frontend) {
    this.frontend = frontend
    frontend.setInitialTime(this.it)
    while (this.cbQ.length) {
      this.frontend.receiveClientbound(...this.cbQ.shift())
    }
    while (this.sbQ.length) {
      this.frontend.receiveServerbound(...this.sbQ.shift())
    }
  }

  receiveClientbound (name, params, size, state) {
    if (this.frontend) {
      this.frontend.receiveClientbound(name, params, size, state)
    } else {
      this.cbQ.push([name, params, size, state])
    }
  }

  receiveServerbound (name, params, size, state) {
    if (this.frontend) {
      this.frontend.receiveServerbound(name, params, size, state)
    } else {
      this.sbQ.push([name, params, size, state])
    }
  }

  get length () {
    return this.cbQ.length
  }
}

function listen (object, options = {}) {
  const emitter = object._client ? object._client : object
  const queue = new IOQueue()

  function handleNMPClient () {
    emitter.on('packet', (data, metadata, buffer) => {
      const { name, state, size } = metadata
      queue.receiveClientbound(name, data, size, state)
    })

    emitter._write = emitter.write
    emitter.write = (name, data) => {
      emitter._write(name, data)
      queue.receiveServerbound(name, data, JSON.stringify(data).length, emitter.state)
    }

    emitter._writeRaw = emitter.writeRaw
    emitter.writeRaw = (buffer) => {
      emitter._writeRaw(buffer)
      queue.receiveServerbound('raw', buffer.toString('hex'), buffer.length, emitter.state)
    }
  }

  function handleNMPServer () {
    throw new Error('Not implemented')
  }

  function handlePrismarineProxy () {
    // clientbound
    const proxy = emitter
    proxy.on('incoming', (data, meta, toClient, toServer) => {
      toClient.write(meta.name, data) // otherwise send the packet to the client
      queue.receiveClientbound(meta.name, data, meta.size, meta.state)
    })

    // serverbound
    proxy.on('outgoing', (data, meta, toClient, toServer) => {
      toServer.write(meta.name, data) // otherwise send the packet to the client
      queue.receiveServerbound(meta.name, data, meta.size, meta.state)
    })
  }

  function handleBedrockClient () {
    emitter.on('packet', ({ data: { name, params }, meta: { size } }) => {
      queue.receiveClientbound(name, params, size, '')
    })

    emitter._write = emitter.write
    emitter.write = (name, data) => {
      emitter._write(name, data)
      queue.receiveServerbound(name, data, JSON.stringify(data).length, '')
    }

    emitter._queue = emitter.queue
    emitter.queue = (name, data) => {
      emitter._queue(name, data)
      queue.receiveServerbound(name, data, JSON.stringify(data).length, '')
    }

    emitter._writeRaw = emitter.writeRaw
    emitter.writeRaw = (buffer) => {
      emitter._writeRaw(buffer)
      queue.receiveServerbound('raw', buffer.toString('hex'), buffer.length, '')
    }
  }

  function handleBedrockRelay () {
    const proxy = emitter
    proxy.on('connect', player => {
      queue.it = (Date.now())

      player.on('login', (client) => {
        debug('login', client)
      })

      player.on('clientbound', ({ name, params }, { metadata: { size } }) => {
        queue.receiveClientbound(name, params, size)
      })

      player.on('serverbound', ({ name, params }, { metadata: { size } }) => {
        queue.receiveServerbound(name, params, size)
      })
    })
  }

  function handleBedrockServer () {
    throw new Error('Not implemented')
  }

  if (emitter.on) {
    if (emitter.splitter) { // nmp client
      handleNMPClient()
    } else if (emitter.toServerClients) { // prismarine-proxy
      handlePrismarineProxy()
    } else if (emitter.socketServer) { // nmp server
      handleNMPServer()
    } else if (emitter.startGameData) { // bedrock-protocol client
      handleBedrockClient()
    } else if (emitter.RelayPlayer) { // bedrock-protocol relay
      handleBedrockRelay()
    } else if (emitter.advertisement) { // bedrock-protocol server
      handleBedrockServer()
    }

    const port = options.port || 9222

    if (!options.useBundledDevTools) {
      console.info('Please copy and paste this URL into a new Chrome browser tab and go to the Network tab:\n')
      console.info('\u001b[34m devtools://devtools/bundled/inspector.html?ws=127.0.0.1:' + port + '\u001b[0m')
      console.info('\nYou can bookmark the URL above for later reference.')
    }
    return new Promise(resolve => {
      server(options.useBundledDevTools, false, options.port, frontend => {
        queue.setFrontend(frontend)
        resolve(frontend)
      })
    })
  } else {
    throw new Error('Emitter must be an event emitter. See the documentation for more info.')
  }
}

module.exports = listen
