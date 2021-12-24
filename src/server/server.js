const debug = require('debug')('mc-netlog')
const { WebSocketServer } = require('ws')
const cp = require('child_process')
const bedrockProxy = require('./bedrock-proxy')
const mcpcProxy = require('./mcpc-proxy')
const FrontendConnection = require('./FrontendConnection')

function start (options, runFrontendStandalone, cb = () => {}) {
  const useBuiltinDevTools = options.useBundledDevTools || false
  const port = options.port || 9222

  const wss = new WebSocketServer({ port: port })
  globalThis._mcnetLogServer = wss
  if (useBuiltinDevTools) {
    const proc = cp.exec('npm run electron 127.0.0.1:' + port, {
      stdio: 'inherit'
    })
    proc.stdout.pipe(process.stdout)
  }

  wss.on('connection', function connection (ws) {
    debug('Connection', ws)
    const frontend = new FrontendConnection(ws, options)
    let proxy
    cb(frontend)

    ws.on('message', function message (data) {
      const body = JSON.parse(data)
      if (body.from === 'frontend') {
        if (body.type === 'start-bedrock-proxy') {
          const [remoteServerHost, remoteServerPort] = body.data.server.split(':')
          const port = body.data.port
          debug('start-bedrock-proxy', remoteServerHost, remoteServerPort, port)
          proxy = bedrockProxy({ remoteServerHost, remoteServerPort, localBindPort: port }, frontend)
          ws.send(JSON.stringify({
            from: 'backend',
            type: 'start-ok'
          }))
        } else if (body.type === 'start-mcpc-proxy') {
          const [remoteServerHost, remoteServerPort] = body.data.server.split(':')
          const port = body.data.port
          debug('start-mcpc-proxy', remoteServerHost, remoteServerPort, port)
          proxy = mcpcProxy({ remoteServerHost, remoteServerPort, localBindPort: port }, frontend)
          ws.send(JSON.stringify({
            from: 'backend',
            type: 'start-ok'
          }))
        }
      } else {
        if (body.method === 'Network.getResponseBody') {
          const response = frontend.getResponseBody(body)
          frontend.respond(body.id, response)
        }
      }

      debug('received: %s', data)
    })

    ws.on('close', () => {
      if (runFrontendStandalone) {
        console.log('[prismarine-inspector] Frontend was closed. Goodbye!')
        process.exit(0)
      }
    })

    if (!useBuiltinDevTools) {
      const Entry = require('./entry')
      Entry.counter--
      // todo, Right click on an item in the left list and select "Replay XHR" to open the buffer in VS Code.
      const entry = new Entry({
        name: 'README IN PREVIEW',
        params: `
        <h2>Welcome to prismarine-inspector</h2>
        <p>prismarine-inspector is a tool to view Minecraft network traffic. At the left is a list of packets. Blue (&#128309;) indicates a clientbound packet and green (&#128994;) indicates a serverbound packet.</p>
        <p>Click on a packet to see its details in JSON format. </p>
        <p>Enable the METHOD and PROTOCOL tabs to see the packet send time and time since last packet.</p>
        <p>Click on the XHR tab to see Clientbound packets, and JS to see Serverbound packets.</p>
        <p>Packets will appear shortly...</p>
      `,
        size: 100,
        method: 'other'
      })
      entry.mimeType = 'text/html'
      frontend.receiveSpecial(entry)
    }

    if (useBuiltinDevTools) {
      ws.send(JSON.stringify({
        from: 'backend',
        type: 'start-ok'
      }))
    }
  })
}

module.exports = start
