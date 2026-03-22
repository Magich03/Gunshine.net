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
      // Read avatarID (first int after command type)
      const avatarId = stream.readInt()
      const executeTick = stream.readInt()
      
      console.log(`[DebugCommandHandler] DEBUG_ADD_MONEY for avatar ${avatarId}`)
      
      // Echo back the command so client executes it locally
      // The client will add money to its local state
      const DebugCommand = require('../Server/DebugCommand')
      const debugCmd = new DebugCommand(avatarId)
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
