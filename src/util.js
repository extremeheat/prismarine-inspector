module.exports = {
  serialize(o) {
    return JSON.stringify(o, (key, value) => typeof value === 'bigint' ? String(value) : value)
  }
}