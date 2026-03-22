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
        // Handle both property name formats: idHigh:idLow or highId:lowId
        const playerHighId = client.player.idHigh !== undefined ? client.player.idHigh : client.player.highId
        const playerLowId = client.player.idLow !== undefined ? client.player.idLow : client.player.lowId
        
        if (playerHighId !== avatarIdHigh || playerLowId !== avatarIdLow) {
          console.log(`[MoveCommandHandler] Player ${avatarIdHigh}:${avatarIdLow} tried to move another player (stored: ${playerHighId}:${playerLowId})`)
          return { success: false, error: 'Invalid player ID' }
        }

        // Validate position (very permissive - don't know actual map bounds)
        // Reject obviously invalid positions (way outside any reasonable map)
        const maxCoord = 100000
        if (x < -maxCoord || x > maxCoord || y < -maxCoord || y > maxCoord) {
          console.log(`[MoveCommandHandler] Invalid position: ${x}, ${y}`)
          return { success: false, error: 'Invalid position' }
        }

        // Update player position
        client.player.position = { x, y, layer: layerGlobalID }

        console.log(`[MoveCommandHandler] Player ${avatarIdHigh}:${avatarIdLow} moved to (${x}, ${y})`)

        // For single-player: send minimal response so client knows command was received
        // Client moves locally and sends command for validation
        const moveCommand = new MoveCommand(avatarIdHigh, avatarIdLow, x, y, layerGlobalID)
        moveCommand.executeTick = 0 // Execute immediately

        return {
          success: true,
          commands: [moveCommand] // Send back to confirm
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
