const PiranhaMessage = require('../../PiranhaMessage')

/**
 * CommandResultMessage (ID: 20403)//thzis id dont exist on client!!
 * Server sends command execution result to client
 */
class CommandResultMessage extends PiranhaMessage {
  constructor(client, result = {}) {
    super()
    this.client = client
    this.result = result
    this.id = 20400
    this.version = 1
  }

  encode() {
    // Write success flag
    this.writeByte(this.result.success ? 1 : 0)
    
    // Write result as JSON
    const jsonStr = JSON.stringify(this.result)
    this.writeString(jsonStr)
  }

  send() {
    // Use base class send() - DO NOT encrypt server->client messages
    // Client does not decrypt incoming messages (only client->server are encrypted)
    super.send()
  }
}

module.exports = CommandResultMessage
