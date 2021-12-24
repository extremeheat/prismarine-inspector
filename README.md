Minecraft protocol packet viewer using Chrome DevTools

Supports `node-minecraft-protocol` and `bedrock-protocol`

## Usage

### as a library

#### with mineflayer...

```js
const netlog = require('mc-netlog')
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({ 'host': 'localhost' })
netlog.listen(bot, { useBundledDevTools: false })

// ...
bot.on('spawn', () => console.log('spawned'))
```

#### with prismarine-proxy

```js
const netlog = require('mc-netlog')
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({ 'host': 'localhost' })
netlog.listen(bot, { useBundledDevTools: false })

// ...
bot.on('spawn', () => console.log('spawned'))
```

#### with node-minecraft-protocol client

```js
const nmp = require('minecraft-protocol')
const netlog = require('mc-netlog')

const client = nmp.createClient(...)
netlog.listen(client)
```

#### with bedrock-protocol client

```js
const bp = require('bedrock-protocol')
const netlog = require('mc-netlog')

const client = bp.createClient(...)
netlog.listen(client)
```

### with standalone client

The package comes with a basic standalone client for quick debugging with
limited functionality.

Install the package locally or globally and run:

```js
npx mc-netlog
```

## Features

* log in-bound/out-bound packets with timestamps
* view JSON data
* usable as a library

Thanks to @kdzwinel's [betwixt](https://github.com/kdzwinel/betwixt) for the baseline implementation

#### License

* See LICENSE - this repo contains a bundled copy of Chromium DevTools, Copyright 2014 The Chromium Authors.