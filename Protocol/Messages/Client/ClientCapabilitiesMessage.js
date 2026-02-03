const PiranhaMessage = require('../../PiranhaMessage')

class ClientCapabilitiesMessage extends PiranhaMessage {
  constructor (bytes, client) {
    super(bytes)
    this.client = client
    this.id = 10107
    this.version = 1
  }

  async decode () {
    this.data = {}

    this.data.Ping = this.readInt()
    this.data.ConnectionInterface = this.readString()

    console.log(this.data)
  }

  async process () {}
}

module.exports = ClientCapabilitiesMessage