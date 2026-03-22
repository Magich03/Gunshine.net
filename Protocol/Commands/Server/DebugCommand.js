const Command = require('./Command')

/**
 * DebugCommand (type 1000)
 * 
 * Sent by server in EndTurnMessage to tell clients a debug command was executed.
 * Matches client's class_548 structure.
 * 
 * Encoding:
 * - avatarID high (int)
 * - avatarID low (int)
 * - executeTick (int) [from base]
 */
class DebugCommand extends Command {
  constructor(avatarIdHigh = 0, avatarIdLow = 0) {
    super()
    this.avatarIdHigh = avatarIdHigh
    this.avatarIdLow = avatarIdLow
  }

  getCommandType() {
    return 1000 // DEBUG_ADD_MONEY
  }

  encode(stream) {
    stream.writeInt(this.avatarIdHigh)
    stream.writeInt(this.avatarIdLow)
    super.encode(stream)
  }
}

module.exports = DebugCommand
