class Entry {
  static counter = 1
  mimeType = 'application/json'
  constructor(options) {
    this.headers = {
      'State': options.state || '',
    }
    Object.assign(this, options)

    this.startTime = Date.now()
    this.wallTime = Date.now() / 1000
    this.id = Entry.counter++
  }

  getId() {
    return this.id
  }

  get title() {
    return ({ clientbound: '🔵 ', serverbound: '🟢 ' }[this.method] ?? '') + this.name
  }
}

module.exports = Entry