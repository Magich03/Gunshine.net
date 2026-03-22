const CommandHandler = require('./CommandHandler')
const MoveCommand = require('../Server/MoveCommand')

/**
 * MoveCommandHandler
 * 
 * Processes MOVE command (type 501) from client.
 * Matches client's class_552 encode order.
 * 
 * Client sends:
 * - avatarID high (int)
 * - avatarID low (int)
 * - x (int)
 * - y (int)
 * - layerGlobalID (int)
 * - executeTick (int)
 */
class MoveCommandHandler extends CommandHandler {
  getCommandType() {
    return 501 // COMMAND_TYPE_MOVE
  }

  async handle(client, stream) {
    try {
      // Decode command data (matching client's class_552.encode order)
      const avatarIdHigh = stream.readInt()
      const avatarIdLow = stream.readInt()
      const x = stream.readInt()
      const y = stream.readInt()
      const layerGlobalID = stream.readInt()
      const executeTick = stream.readInt()

      // Verify this is the client's own player
      if (client.player) {
        if (client.player.highId !== avatarIdHigh || client.player.lowId !== avatarIdLow) {
          console.log(`[MoveCommandHandler] Player ${avatarIdHigh}:${avatarIdLow} tried to move another player`)
          return { success: false, error: 'Invalid player ID' }
        }

        // Validate position (basic bounds check)
        const maxDistance = 1000
        if (x < -maxDistance || x > maxDistance || y < -maxDistance || y > maxDistance) {
          console.log(`[MoveCommandHandler] Invalid position: ${x}, ${y}`)
          return { success: false, error: 'Invalid position' }
        }

        // Update player position
        client.player.position = { x, y, layer: layerGlobalID }

        console.log(`[MoveCommandHandler] Player ${avatarIdHigh}:${avatarIdLow} moved to (${x}, ${y})`)

        // Return success and command to broadcast to OTHER players
        // (The moving player already knows their own position)
        const moveCommand = new MoveCommand(avatarIdHigh, avatarIdLow, x, y, layerGlobalID)
        moveCommand.executeTick = executeTick

        return {
          success: true,
          commands: [moveCommand] // Broadcast to other clients
        }
      }

      return { success: false, error: 'No player data' }
    } catch (err) {
      console.error('[MoveCommandHandler] Error processing move:', err)
      return { success: false, error: 'Processing error' }
    }
  }
}

module.exports = MoveCommandHandler
