#!/usr/bin/env node
const server = require('./server')

const offset = Math.floor(Math.random() * 100)
const port = process.argv[2] || (9222 + offset)
server({ useBundledDevTools: true, port }, true)
