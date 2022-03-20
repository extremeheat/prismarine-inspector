const path = require('path')
const { app, BrowserWindow } = require('electron')
// const buildMenu = require('./back/menu')
const host = process.argv[2]

function createMainWindow () {
  const window = new BrowserWindow({
    title: 'Minecraft Network Logger',
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      preload: path.join(__dirname, './front/preload.js')
    }
  })

  // Open dev tools on load
  // window.webContents.openDevTools()

  // window.loadFile(path.join(__dirname, './client/index.html'))
  if (host) {
    window.loadURL('file://' + __dirname + '/dt/inspector.html?ws=' + host)
  } else {
    window.loadURL('file://' + __dirname + '/dt/inspector.html?electron=true')
  }

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
