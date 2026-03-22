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
      // Read debug command data
      const debugType = stream.readInt()
      
      console.log(`[DebugCommandHandler] Received debug command: ${debugType}`)
      
      // Handle different debug commands based on type
      switch (debugType) {
        case 0: // Add money
          if (client.player && client.player.resources) {
            client.player.resources.money = (client.player.resources.money || 0) + 1000
            console.log(`[DebugCommandHandler] Added 1000 money`)
          }
          break
        case 1: // Set level
          // Read level
          const level = stream.readInt()
          if (client.player) {
            client.player.level = level
            console.log(`[DebugCommandHandler] Set level to ${level}`)
          }
          break
        default:
          console.log(`[DebugCommandHandler] Unknown debug type: ${debugType}`)
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
