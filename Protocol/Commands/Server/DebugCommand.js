const Command = require('./Command')

/**
 * DebugCommand (type 1000)
 * 
 * Sent by server in EndTurnMessage to tell clients a debug command was executed.
 * Matches client's class_548 structure.
 * 
 * Encoding:
 * - avatarID (int)
 * - executeTick (int) [from base]
 */
class DebugCommand extends Command {
  constructor(avatarId = 0) {
    super()
    this.avatarId = avatarId
  }

  getCommandType() {
    return 1000 // DEBUG_ADD_MONEY
  }

  encode(stream) {
    stream.writeInt(this.avatarId)
    super.encode(stream)
  }
}

module.exports = DebugCommand
