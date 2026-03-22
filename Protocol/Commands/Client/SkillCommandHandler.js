const CommandHandler = require('./CommandHandler')
const SkillCommand = require('../Server/SkillCommand')

/**
 * SkillCommandHandler
 * 
 * Processes SKILL command (type 503) from client.
 * Matches client's class_476 encode order.
 * 
 * Client sends:
 * - avatarID high (int)
 * - avatarID low (int)
 * - skillGlobalID (int)
 * - hasTarget (boolean)
 * - targetX (int) [if hasTarget]
 * - targetY (int) [if hasTarget]
 * - executeTick (int)
 */
class SkillCommandHandler extends CommandHandler {
  getCommandType() {
    return 503 // COMMAND_TYPE_SKILL
  }

  async handle(client, stream) {
    try {
      // Decode command data (matching client's class_476.encode order)
      const avatarIdHigh = stream.readInt()
      const avatarIdLow = stream.readInt()
      const skillGlobalID = stream.readInt()
      const hasTarget = stream.readBoolean()
      const targetX = hasTarget ? stream.readInt() : 0
      const targetY = hasTarget ? stream.readInt() : 0
      const executeTick = stream.readInt()

      // Verify this is the client's own player
      if (client.player) {
        // Handle both property name formats: idHigh:idLow or highId:lowId
        const playerHighId = client.player.idHigh !== undefined ? client.player.idHigh : client.player.highId
        const playerLowId = client.player.idLow !== undefined ? client.player.idLow : client.player.lowId
        
        if (playerHighId !== avatarIdHigh || playerLowId !== avatarIdLow) {
          console.log(`[SkillCommandHandler] Player ${avatarIdHigh}:${avatarIdLow} tried to use skill for another player (stored: ${playerHighId}:${playerLowId})`)
          return { success: false, error: 'Invalid player ID' }
        }

        // Validate skill (basic check - skillGlobalID should be > 0)
        if (skillGlobalID <= 0) {
          console.log(`[SkillCommandHandler] Invalid skill ID: ${skillGlobalID}`)
          return { success: false, error: 'Invalid skill' }
        }

        // Check mana/stamina cost (simplified - would need skill data from CSV)
        if (client.player.resources.mana < 10) {
          return { success: false, error: 'Not enough mana' }
        }

        // Deduct mana
        client.player.resources.mana -= 10

        console.log(`[SkillCommandHandler] Player ${avatarIdHigh}:${avatarIdLow} used skill ${skillGlobalID} at (${targetX}, ${targetY})`)

        // Return success and command to broadcast to OTHER players
        const skillCommand = new SkillCommand(avatarIdHigh, avatarIdLow, skillGlobalID, targetX, targetY, hasTarget)
        skillCommand.executeTick = executeTick

        return {
          success: true,
          commands: [skillCommand] // Broadcast to other clients
        }
      }

      return { success: false, error: 'No player data' }
    } catch (err) {
      console.error('[SkillCommandHandler] Error processing skill:', err)
      return { success: false, error: 'Processing error' }
    }
  }
}

module.exports = SkillCommandHandler
