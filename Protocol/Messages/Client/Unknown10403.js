const PiranhaMessage = require('../../PiranhaMessage')

class Unknown10403 extends PiranhaMessage {
  constructor (bytes, client) {
    super(bytes)
    this.client = client
    this.id = 10403
    this.version = 1
  }

  async decode () {
    this.data = {}

    this.data.Unknown = this.readDataReference()

    console.log(this.data)
  }

  async process () {}
}

module.exports = Unknown10403