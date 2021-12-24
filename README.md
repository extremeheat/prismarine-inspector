# prismarine-inspector

<img align="right" src="https://user-images.githubusercontent.com/13713600/147316906-a8b99aea-0e17-4882-a1de-c70149a70916.png" width="50%" height="50%" />
Minecraft protocol packet viewer using Chrome DevTools.

Supports `mineflayer`, `node-minecraft-protocol`, `prismarine-proxy` and `bedrock-protocol`.

If you have Chrome installed, you can use your existing Chrome browser or a bundled copy of DevTools.

[![NPM version](https://img.shields.io/npm/v/prismarine-inspector.svg)](http://npmjs.com/package/prismarine-inspector)
[![Build Status](https://github.com/extremeheat/mc-netlog/workflows/CI/badge.svg)](https://github.com/extremeheat/mc-netlog/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)


<br/>

## Install

As a developer tool, you probably want to install it globally:

```js
npm install -g prismarine-inspector
```

or usable with npx if you just want to run the standalone client (see below):

```js
npx prismarine-inspector
```

## Usage

### as a library

The default export takes emitter and options arguments. If `useBundledDevTools` is false you will get a link to open in Chrome, otherwise if true you will get an Electron window.
```ts
netlog(emitter, options)
```

#### with mineflayer...

```js
const netlog = require('prismarine-inspector')
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({ 'host': 'localhost' })
netlog(bot, { useBundledDevTools: false })

// ...
bot.on('spawn', () => console.log('spawned'))
```

#### with prismarine-proxy

See examples/

#### with node-minecraft-protocol client

```js
const nmp = require('minecraft-protocol')
const netlog = require('prismarine-inspector')

const client = nmp.createClient(...)
netlog(client)
```

#### with bedrock-protocol client

```js
const bp = require('bedrock-protocol')
const netlog = require('prismarine-inspector')

const client = bp.createClient(...)
netlog(client)
```

### as a standalone client

<img align="right" src="https://user-images.githubusercontent.com/13713600/147315109-0508d97c-8d88-4db4-bf05-1abef29cd07a.png" width="30%" width="30%" />

The package comes with a basic standalone client for quick debugging with
limited functionality.

Install the package locally or globally and run:

```js
npx prismarine-inspector
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

(repo formerly known as MC-NetLog)