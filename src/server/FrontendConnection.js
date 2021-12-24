const RequestEntry = require('./entry')

class FrontendConnection {
  packets = []

  constructor(connection, { useBundledDevTools, ignore }) {
    this.connection = connection
    this.outbound = {}
    this.outboundCount = 0
    this.ignore = ignore

    if (useBundledDevTools) {
      this.categories = { clientbound: 'Clientbound', serverbound: 'Serverbound', other: 'Other' }
    } else {
      this.categories = { clientbound: 'XHR', serverbound: 'Script', other: 'Other' }
    }
  }

  setInitialTime(initTime) {
    this.initTime = initTime
  }

  getPreRequest(requestEntry) {
    return {
      requestId: `${requestEntry.getId()}`,
      frameId: '123.2',
      loaderId: '123.67',
      documentURL: 'https://betwixt',
      request: {
        url: requestEntry.title,
        method: `${new Date(requestEntry.startTime).toISOString().slice(11, -1)}, +${Math.floor(requestEntry.startTime - this.initTime)} ms`,
        headers: requestEntry.headers,
        initialPriority: 'High',
        mixedContentType: 'none',
        postData: requestEntry.postData || '',
      },
      timestamp: requestEntry.startTime,
      wallTime: requestEntry.wallTime,
      initiator: {
        type: 'serverbound',
      },
      type: this.categories[requestEntry.method],
    };
  }

  // irrelevant
  getPostResponse(requestEntry) {
    const responseReceived = {
      requestId: String(requestEntry.getId()),
      frameId: '123.2',
      loaderId: '123.67',
      timestamp: requestEntry.startTime,
      type: this.categories[requestEntry.method],
      response: {
        url: requestEntry.title,
        protocol: `+ ${Math.floor(requestEntry.startTime - this.lastTime) || 0} ms` + (requestEntry.state ?  `, ${requestEntry.state}` : ''),
        status: 200,
        statusText: 'OK',
        headers: {},
        headersText: '',
        mimeType: requestEntry.mimeType,
        connectionReused: true,
        connectionId: requestEntry.getId(),
        encodedDataLength: requestEntry.size,
        fromDiskCache: true,
        fromServiceWorker: false,
        timing: {
          requestTime: requestEntry.startTime,
          proxyStart: -1,
          proxyEnd: -1,
          dnsStart: -1,
          dnsEnd: -1,
          sslStart: -1,
          sslEnd: -1,
          workerStart: -1,
          workerReady: -1,
          pushStart: 0,
          pushEnd: 0,
          connectStart: -1,
          connectEnd: -1,
          sendStart: 0.0001, /* 0 here makes TTFB to be replaced with "Staled" in DT front-end */
          sendEnd: -1,
          receiveHeadersEnd: requestEntry.wallTime,
        },
        requestHeaders: {},
        remoteIPAddress: '0',
        remotePort: '0',
        securityState: 'neutral',
      },
    }

    const dataReceived = {
        requestId: String(requestEntry.getId()),
        timestamp: requestEntry.startTime,
        dataLength: 100,
        encodedDataLength: 100,
    }

    const loadingFinished = {
      requestId: String(requestEntry.getId()),
      timestamp: requestEntry.startTime,
      encodedDataLength: requestEntry.size,
    };

    this.lastTime = Date.now()

    return [
      responseReceived,
      dataReceived,
      loadingFinished,
    ]
  }

  getResponseBody(message) {
    const req = this.outbound[message.params.requestId];
    if (!req) {
      return;
    }
    const body = typeof req.params === 'object' ? JSON.stringify(req.params, (key, value) => typeof value === 'bigint' ? String(value) : value) : req.params;
    return {
      body,
      base64Encoded: false
    }
  }

  send(method, params) {
    this.connection.send(JSON.stringify({
      method, params
    }))
  }

  respond(id, result) {
    this.connection.send(JSON.stringify({
      id, result
    }))
  }

  sendPacketToFrontend(requestEntry) {
    const preRequest = this.getPreRequest(requestEntry);
    // console.log(preRequest, requestEntry)
    const [responseReceived, dataReceived, loadingFinished] = this.getPostResponse(requestEntry);
    this.send('Network.requestWillBeSent', preRequest);
    this.send('Network.responseReceived', responseReceived);
    // this.send('Network.dataReceived', dataReceived);
    this.send('Network.loadingFinished', loadingFinished);
  }

  receiveClientbound(name, params, size, state) {
    if (this.ignore && name.match(this.ignore)) return 
    const requestEntry = new RequestEntry({
      name, params, size, state, method: 'clientbound'
    });
    this.outbound[requestEntry.getId()] = requestEntry;
    this.sendPacketToFrontend(requestEntry);
    this.outboundCount++
  }

  receiveServerbound(name, params, size, state) {
    if (this.ignore && name.match(this.ignore)) return
    const requestEntry = new RequestEntry({
      name, params, size, state, method: 'serverbound'
    });
    this.outbound[requestEntry.getId()] = requestEntry;
    this.sendPacketToFrontend(requestEntry);
    this.outboundCount++
  }

  receiveSpecial(requestEntry) {
    this.outbound[requestEntry.getId()] = requestEntry;
    this.sendPacketToFrontend(requestEntry);
    this.outboundCount++
  }
}

module.exports = FrontendConnection