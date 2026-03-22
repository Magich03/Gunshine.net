/**
 * CommandHandler Base Class
 * 
 * Server-side handler for processing game commands from clients.
 * Each command type (501 MOVE, 503 SKILL, etc.) has a corresponding handler.
 * 
 * The handler:
 * 1. Decodes command data from ByteStream
 * 2. Validates and processes the command
 * 3. Updates game state
 * 4. Returns a result with optional commands to broadcast via EndTurnMessage
 */
class CommandHandler {
  /**
   * Command type ID this handler processes (501, 502, 503, etc.)
   * @returns {number}
   */
  getCommandType() {
    throw new Error('getCommandType() must be overridden')
  }

  /**
   * Handle a command received from client
   * 
   * @param {Object} client - Client connection
   * @param {ByteStream} stream - ByteStream with command data (offset already past command type)
   * @returns {Object} Result: { success: boolean, error?: string, commands?: Command[] }
   */
  async handle(client, stream) {
    throw new Error('handle() must be overridden')
  }
}

module.exports = CommandHandler
