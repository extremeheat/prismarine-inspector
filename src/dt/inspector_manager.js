// Patch
// const remote = require('electron').remote

class Config {
  constructor(edition) {
    this.edition = edition
  }

  get() {
    this.data = window.localStorage.getItem('last-server-' + this.edition)
    try {
      return JSON.parse(this.data)
    } catch (e) {
      return null
    }
  }

  set(server, port, version) {
    window.localStorage.setItem('last-server-' + this.edition, JSON.stringify({
      'server-input': server,
      'server-port': port,
      'server-version': version
    }))
  }
}

function OnGo(edition) {
  const config = new Config(edition)
  const server = document.querySelector('#server-input').value
  const port = document.querySelector('#server-port').value
  const version = document.querySelector('#server-version').value
  config.set(server, port, version)
  
  if (globalThis.socket) {
    globalThis.socket.send(JSON.stringify({
      from: 'frontend',
      type: 'start-' + edition + '-proxy',
      data: {
        server,
        port,
        version
      }
    }))
  } else {
    alert('Service not connected')
  }
}

function openServerInputDialog(edition='bedrock') {
  const superlay = document.querySelector('.superlay')
  superlay.style.display = 'block'

  let config = new Config(edition)
  if (!config.get()) {
    const defaultConfig = {
      mcpc: {
        'server-input': '127.0.0.1:25565',
        'server-port': 25560,
        'server-version': '1.18.2'
      },
      bedrock: {
        'server-input': '127.0.0.1:19130',
        'server-port': 19131,
        'server-version': '1.18.10'
      }
    }
    config.set(defaultConfig[edition]['server-input'], defaultConfig[edition]['server-port'], defaultConfig[edition]['server-version'])
  }

  let o = config.get()

  superlay.innerHTML = `<div style='text-align: center;'>
  <h3>Create a Minecraft proxy</h3>
  <small>The server must be in offline mode!</small>
  <p>Remote Server Address <br/><input id="server-input" type="text" value="${o['server-input']}">
  <p>Proxy Listen Port <br/><input id="server-port" type="text" value="${o['server-port']}"></p>
  <p>Proxy Minecraft Version <br/><input id="server-version" type="text" value="${o['server-version']}"></p>

  <button onclick='OnGo("${edition}")'>Go</button>
</div>`
}

window.onready = function() {
  globalThis.socketEmitter.on('message', message => {
    if (message.from === 'backend') {
      if (message.type === 'start-ok') {
        console.log('Proxy start OK')
        document.querySelector('.superlay').style.display = 'none'
      }
    }
  })  
}

window.onerror = message => {
  console.error(message)
  alert('Error: ' + message + '\n\nPlease restart the program.')
}