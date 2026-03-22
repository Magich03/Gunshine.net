const CommandHandler = require('./CommandHandler')

/**
 * DebugCommandHandler
 * 
 * Handles DEBUG commands (type 1000+) from client.
 * These are debug/cheat commands like adding money, setting level, etc.
 */
class DebugCommandHandler extends CommandHandler {
  getCommandType() {
    return 1000 // DEBUG_ADD_MONEY
  }

  async handle(client, stream) {
    try {
      // Read avatarID as two ints (matching client's readLong)
      const avatarIdHigh = stream.readInt()
      const avatarIdLow = stream.readInt()
      const executeTick = stream.readInt()
      
      console.log(`[DebugCommandHandler] DEBUG_ADD_MONEY for avatar ${avatarIdHigh}:${avatarIdLow}`)
      
      // Echo back the command so client executes it locally
      // The client will add money to its local state
      const DebugCommand = require('../Server/DebugCommand')
      const debugCmd = new DebugCommand(avatarIdHigh, avatarIdLow)
      debugCmd.executeTick = executeTick
      
      console.log(`[DebugCommandHandler] Echoing debug command back to client`)

      return {
        success: true,
        commands: [debugCmd] // Echo back so client executes
      }
    } catch (err) {
      console.error('[DebugCommandHandler] Error processing debug command:', err)
      return { success: false, error: 'Processing error' }
    }
  }
}

module.exports = DebugCommandHandler
