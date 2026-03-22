const ByteStream = require('../../ByteStream')

/**
 * Command Base Class
 * 
 * Server-side representation of game commands (like client's class_141)
 * These commands are sent in EndTurnMessage (20400) to clients
 * 
 * Command Types:
 * - 16: AddPlayerCommand
 * - 17: RemoveObjectCommand  
 * - 18: MoveCommand (type 501 is client MOVE, 18 is server broadcast move)
 * - 501: MOVE
 * - 502: SET_TARGET
 * - 503: SKILL
 * - 505: SWAP_ITEM
 * - etc. (matching client's class_141.as)
 */
class Command {
  constructor() {
    this.executeTick = -1
  }

  /**
   * Command type ID (must match client's class_141.COMMAND_TYPE_*)
   * @returns {number} Command type
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

  /**
   * Static factory to decode command from ByteStream
   * Must be implemented by subclasses
   * @param {ByteStream} stream
   * @returns {Command}
   */
  static decode(stream) {
    throw new Error('decode() static method must be overridden')
  }
}

module.exports = Command
