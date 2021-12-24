## mc-netlog
<img align="right" src="https://user-images.githubusercontent.com/13713600/147316906-a8b99aea-0e17-4882-a1de-c70149a70916.png" width="50%" height="50%" />
Minecraft protocol packet viewer using Chrome DevTools

Supports `mineflayer`, `node-minecraft-protocol`, `prismarine-proxy` and `bedrock-protocol`.

If you have Chrome installed, you can use your existing Chrome browser or a bundled copy of DevTools.



<br/>

## Install
```js
npm i extremeheat/mc-netlog
```

or usable with npx if you just want to run the standalone client (see below):

```js
npx extremeheat/mc-netlog
```

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

### as a standalone client

<img align="right" src="https://user-images.githubusercontent.com/13713600/147315109-0508d97c-8d88-4db4-bf05-1abef29cd07a.png" width="30%" width="30%" />

The package comes with a basic standalone client for quick debugging with
limited functionality.

Install the package locally or globally and run:

```js
npx mc-netlog
```

You will get a small wizard screen to setup a simple proxy. The server you are connecting to **must** be offline.


## Features

* log in-bound/out-bound packets with timestamps
* view JSON data
* usable as a library

Thanks to @kdzwinel's [betwixt](https://github.com/kdzwinel/betwixt) for the baseline implementation

## Setup

Enabling the `Name`, `Method` and `Protocol` tabs will show you the packet name, time of packet send, time since last packet, and Size of a packet. The colors indicate which side the packet is bound to. When using Chrome DevTools, the XHR and Script categories correspond to Clientbound/Serverbound (we can't change them there).

![image](https://user-images.githubusercontent.com/13713600/147314846-ebdd99fb-4b95-4621-aa63-0f26819a8158.png)


#### License

* See LICENSE - this repo contains a bundled copy of Chromium DevTools, Copyright 2014 The Chromium Authors.
