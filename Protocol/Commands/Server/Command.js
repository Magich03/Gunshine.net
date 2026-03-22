/**
 * Command Base Class
 * 
 * Server-side game command to send to clients via EndTurnMessage.
 * These match the client's command types (501 MOVE, 16 ADD_PLAYER, etc.)
 */
class Command {
  constructor() {
    this.executeTick = -1
  }

  /**
   * Command type ID (must match client's class_141 constants)
   * @returns {number}
   */
  getCommandType() {
    throw new Error('getCommandType() must be overridden')
  }

  /**
   * Encode command to ByteStream
   * @param {ByteStream} stream 
   */
  encode(stream) {
    stream.writeInt(this.executeTick)
  }

  /**
   * Decode command from ByteStream
   * @param {ByteStream} stream
   */
  decode(stream) {
    this.executeTick = stream.readInt()
  }
}

module.exports = Command
