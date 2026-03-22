const Command = require('./Command')
const ByteStream = require('../../ByteStream')

/**
 * SkillCommand (type 503)
 * 
 * Sent by server in EndTurnMessage to tell clients a player used a skill
 * Matches client's class_476 structure
 * 
 * Encoding:
 * - avatarID (long = 2 ints: high, low)
 * - skillData (encoded skill)
 * - targetData (encoded target position/info)
 * - executeTick (int) [from base]
 */
class SkillCommand extends Command {
  constructor(avatarIdHigh = 0, avatarIdLow = 1, skillGlobalID = 0, targetX = 0, targetY = 0) {
    super()
    this.avatarIdHigh = avatarIdHigh
    this.avatarIdLow = avatarIdLow
    this.skillGlobalID = skillGlobalID
    this.targetX = targetX
    this.targetY = targetY
  }

  getCommandType() {
    return 503 // COMMAND_TYPE_SKILL
  }

  encode(stream) {
    stream.writeLong(this.avatarIdHigh, this.avatarIdLow)
    
    // Skill data - write as GlobalID
    // For now, just write the globalID as a VarInt pair (table 0, row=skillGlobalID)
    if (this.skillGlobalID > 0) {
      stream.writeVInt(0)  // table index
      stream.writeVInt(this.skillGlobalID)
    } else {
      stream.writeVInt(0)
    }
    
    // Target data - write as position
    // For now, just write coordinates as VarInts
    stream.writeVInt(this.targetX >> 8)  // compressed X
    stream.writeVInt(this.targetY >> 8)  // compressed Y
    
    super.encode(stream)
  }

  static decode(stream) {
    const [avatarIdHigh, avatarIdLow] = stream.readLong()
    
    // Read skill data
    const skillTable = stream.readVInt()
    const skillId = stream.readVInt()
    
    // Read target data
    const targetX = stream.readVInt() << 8
    const targetY = stream.readVInt() << 8
    
    const cmd = new SkillCommand(avatarIdHigh, avatarIdLow, skillId, targetX, targetY)
    cmd.decode(stream)
    return cmd
  }
}

module.exports = SkillCommand
