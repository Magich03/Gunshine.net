const PiranhaMessage = require('../../PiranhaMessage')

/**
 * EndTurnMessage (20400)
 * 
 * Sent to client to deliver game commands and state updates.
 * Commands use the client's command types (501 MOVE, 502 SET_TARGET, 503 SKILL, etc.)
 * 
 * Client class: package_57.class_161
 * Handler: package_12.class_21 lines 318-344 (method_506)
 * 
 * Structure:
 * - int tick1 (current tick)
 * - int tick2 (sub-tick)
 * - int commandCount
 * - For each command:
 *   - int commandType (501, 502, 503, etc. matching client's class_141 types)
 *   - command-specific data (depends on type)
 *   - int executeTick (from base Command)
 */
class EndTurnMessage extends PiranhaMessage {
  constructor(client) {
    super()
    this.id = 20400
    this.client = client
    this.version = 0
    this.commands = []
  }

  /**
   * Add a command to be sent to client
   * @param {Command} command - Command object with getCommandType(), encode() methods
   */
  addCommand(command) {
    if (!command || typeof command.getCommandType !== 'function') {
      throw new Error('Invalid command - must have getCommandType() method')
    }
    this.commands.push(command)
    return this
  }

  async encode() {
    // Tick values - use reasonable small tick values
    // Client expects small positive integers for spawn commands
    this.writeInt(1)   // tick1 - current tick (small value)
    this.writeInt(0)   // tick2 - sub-tick
    
    // Command count
    this.writeInt(this.commands.length)
    
    // Encode each command
    for (const command of this.commands) {
      // Write command type (501, 502, 503, etc.)
      this.writeInt(command.getCommandType())
      
      // Write command-specific data
      command.encode(this)
    }
  }

  send() {
    // Use base class send() - DO NOT encrypt server->client messages
    // Client does not decrypt incoming messages (only client->server are encrypted)
    super.send()
  }
}

module.exports = EndTurnMessage
