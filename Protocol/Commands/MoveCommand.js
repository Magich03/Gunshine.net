const Command = require('./Command')
const ByteStream = require('../../ByteStream')

/**
 * MoveCommand (type 501)
 * 
 * Sent by server in EndTurnMessage to tell clients where player moved to
 * Matches client's class_552 structure
 * 
 * Encoding:
 * - avatarID (long = 2 ints: high, low)
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
    stream.writeLong(this.avatarIdHigh, this.avatarIdLow)
    stream.writeInt(this.x)
    stream.writeInt(this.y)
    stream.writeInt(this.layerGlobalID)
    super.encode(stream)
  }

  static decode(stream) {
    const [avatarIdHigh, avatarIdLow] = stream.readLong()
    const x = stream.readInt()
    const y = stream.readInt()
    const layerGlobalID = stream.readInt()
    
    const cmd = new MoveCommand(avatarIdHigh, avatarIdLow, x, y, layerGlobalID)
    cmd.decode(stream)
    return cmd
  }
}

module.exports = MoveCommand
