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
      
      // Add money and diamonds to player
      if (client.player) {
        if (!client.player.resources) {
          client.player.resources = {}
        }
        
        // Add 1000 gold
        client.player.resources.money = (client.player.resources.money || 0) + 1000
        
        // Add 1000 diamonds (if we have that field)
        client.player.resources.diamonds = (client.player.resources.diamonds || 0) + 1000
        
        console.log(`[DebugCommandHandler] Added 1000 gold and 1000 diamonds to player`)
      }

      return {
        success: true,
        commands: [] // Debug commands don't need to be broadcast
      }
    } catch (err) {
      console.error('[DebugCommandHandler] Error processing debug command:', err)
      return { success: false, error: 'Processing error' }
    }
  }
}

module.exports = DebugCommandHandler
