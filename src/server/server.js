const debug = require('debug')('mc-netlog')
const { WebSocketServer } = require('ws')
const cp = require('child_process')
const bedrockProxy = require('./bedrock-proxy')
const mcpcProxy = require('./mcpc-proxy')
const FrontendConnection = require('./FrontendConnection')

function start (useBuiltinDevTools = false, runFrontendStandalone = false, port = 9222, cb = () => {}) {
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
    const frontend = new FrontendConnection(ws, { useBuiltinDevTools, runFrontendStandalone })
    let proxy
    if (!runFrontendStandalone) {
      // proxy = bedrockProxy({ remoteServerHost: '127.0.0.1', remoteServerPort: 19130, localBindPort: 19131 }, frontend);
      // proxy = mcpcProxy({ remoteServerHost: '127.0.0.1', remoteServerPort: 25565, localBindPort: 25560 }, frontend)
      // if (useBuiltinDevTools) {
      //   ws.send(JSON.stringify({
      //     from: 'backend',
      //     type: 'start-ok'
      //   }))
      // }
    }

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
        console.log('[mc-netlog] Frontend was closed. Goodbye!')
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
        <h2>Welcome to mc-netlog</h2>
        <p>mc-netlog is a tool to view Minecraft network traffic. At the left is a list of packets. Blue (&#128309;) indicates a clientbound packet and green (&#128994;) indicates a serverbound packet.</p>
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

    // ws.send('something');
    // Network.enable
    // ws.send(`{"method":"DOM.disable","params":{"requestId":"undefined","frameId":"123.2","loaderId":"123.67","documentURL":"https://betwixt","request":{"url":"https://google.com","method":"MUM","headers":{"lol":"123"},"initialPriority":"High","mixedContentType":"none","postData":""},"timestamp":0.0036007,"wallTime":1640184612.373,"initiator":{"type":"other"},"type":"XHR"}}`)
    // ws.send(`{"method":"Console.disable","params":{"requestId":"undefined","frameId":"123.2","loaderId":"123.67","documentURL":"https://betwixt","request":{"url":"https://google.com","method":"MUM","headers":{"lol":"123"},"initialPriority":"High","mixedContentType":"none","postData":""},"timestamp":0.0036007,"wallTime":1640184612.373,"initiator":{"type":"other"},"type":"XHR"}}`)
    // ws.send()
    // ws.send(`{"method":"Network.requestWillBeSent","params":{"requestId":"undefined","frameId":"123.2","loaderId":"123.67","documentURL":"https://betwixt","request":{"url":"https://google.com","method":"MUM","headers":{"lol":"123"},"initialPriority":"High","mixedContentType":"none","postData":""},"timestamp":0.0036007,"wallTime":1640184612.373,"initiator":{"type":"other"},"type":"XHR"}}`)
  })
}

module.exports = start
