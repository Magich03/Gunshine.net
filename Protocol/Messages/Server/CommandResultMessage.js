const PiranhaMessage = require('../../PiranhaMessage')

/**
 * CommandResultMessage (ID: 20403)
 * Server sends command execution result to client
 */
class CommandResultMessage extends PiranhaMessage {
  constructor(client, result = {}) {
    super()
    this.client = client
    this.result = result
    this.id = 20403
    this.version = 1
  }

  encode() {
    // Write success flag
    this.writeByte(this.result.success ? 1 : 0)
    
    // Write result as JSON
    const jsonStr = JSON.stringify(this.result)
    this.writeString(jsonStr)
  }

  async send() {
    try {
      this.encode()

      const id = Buffer.alloc(2)
      id.writeUInt16BE(this.id, 0)

      const len = Buffer.alloc(3)
      len.writeUIntBE(this.buffer.length, 0, 3)

      const message = Buffer.concat([id, len, this.buffer])

      // Encrypt
      const encrypted = await this.client.crypto.encrypt(message.slice(5))
      const finalMessage = Buffer.concat([message.slice(0, 5), encrypted])

      this.client.write(finalMessage)
      this.client.log(`[CommandResultMessage] Sent result for command`)
    } catch (err) {
      console.error('Error sending CommandResultMessage:', err)
    }
  }
}

module.exports = CommandResultMessage
