const path = require('path')
const { app, BrowserWindow } = require('electron')
const App = require('./back/app')
const buildMenu = require('./back/menu')
const options = {}
const host = process.argv[2]

function createMainWindow () {
  const window = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      preload: path.join(__dirname, './front/preload.js'),
    }
  })

  // Open dev tools on load
  // window.webContents.openDevTools()

  // window.loadFile(path.join(__dirname, './client/index.html'))
  if (host) {
    window.loadURL('file://' + __dirname + '/dt/inspector.html?ws=' + host);
  } else {
    window.loadURL('file://' + __dirname + '/dt/inspector.html?electron=true');
  }


  // window.webContents.on('devtools-opened', () => {
  //   window.focus()
  //   setImmediate(() => {
  //     window.focus()
  //   })
  // })

  new App(window.webContents)
  // buildMenu(app, window, options)
  return window
}

app.on('ready', () => {
  createMainWindow()
})

app.on('window-all-closed', function () {
  app.quit()
})

app.allowRendererProcessReuse = false
