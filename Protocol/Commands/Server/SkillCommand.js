const Command = require('./Command')

/**
 * SkillCommand (type 503)
 * 
 * Sent by server in EndTurnMessage to tell clients a player used a skill.
 * Matches client's class_476 structure.
 * 
 * Encoding (per class_476.as):
 * - avatarID high (int)
 * - avatarID low (int)
 * - skillGlobalID (int) [via class_305.method_37]
 * - hasTarget (boolean)
 * - targetX (int) [if hasTarget]
 * - targetY (int) [if hasTarget]
 * - executeTick (int) [from base]
 */
class SkillCommand extends Command {
  constructor(avatarIdHigh = 0, avatarIdLow = 1, skillGlobalID = 0, targetX = 0, targetY = 0, hasTarget = true) {
    super()
    this.avatarIdHigh = avatarIdHigh
    this.avatarIdLow = avatarIdLow
    this.skillGlobalID = skillGlobalID
    this.targetX = targetX
    this.targetY = targetY
    this.hasTarget = hasTarget
  }

  getCommandType() {
    return 503 // COMMAND_TYPE_SKILL
  }

  encode(stream) {
    stream.writeInt(this.avatarIdHigh)
    stream.writeInt(this.avatarIdLow)
    
    // Skill data (via class_305.method_37)
    stream.writeInt(this.skillGlobalID)
    
    // Target data (via class_305.method_638)
    stream.writeBoolean(this.hasTarget)
    if (this.hasTarget) {
      stream.writeInt(this.targetX)
      stream.writeInt(this.targetY)
    }
    
    super.encode(stream)
  }
}

module.exports = SkillCommand
