const Command = require('./Command')

/**
 * MoveCommand (type 501)
 * 
 * Sent by server in EndTurnMessage to tell clients a player moved.
 * Matches client's class_552 structure.
 * 
 * Encoding (per class_552.as):
 * - avatarID high (int)
 * - avatarID low (int)
 * - x (int)
 * - y (int)
 * - layerGlobalID (int)
 * - executeTick (int) [from base]
 */
class MoveCommand extends Command {
  constructor(avatarIdHigh = 0, avatarIdLow = 1, x = 0, y = 0, layerGlobalID = 0) {
    super()
    this.avatarIdHigh = avatarIdHigh
    this.avatarIdLow = avatarIdLow
    this.x = x
    this.y = y
    this.layerGlobalID = layerGlobalID
  }

  getCommandType() {
    return 501 // COMMAND_TYPE_MOVE
  }

  encode(stream) {
    stream.writeInt(this.avatarIdHigh)
    stream.writeInt(this.avatarIdLow)
    stream.writeInt(this.x)
    stream.writeInt(this.y)
    stream.writeInt(this.layerGlobalID)
    super.encode(stream)
  }
}

module.exports = MoveCommand
