const PiranhaMessage = require('../../PiranhaMessage')
const { getInstance: getCommandManager } = require('../../Commands/CommandManager')
const EndTurnMessage = require('../Server/EndTurnMessage')

/**
 * CommandExecuteMessage (ID: 10403)
 * 
 * Client sends game commands through this message.
 * Commands use type IDs (501 MOVE, 503 SKILL, etc.) matching client's class_141.
 * 
 * Server processes command, updates state, broadcasts via EndTurnMessage.
 * NO direct response is sent - EndTurnMessage is the "acknowledgment".
 */
class CommandExecuteMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes)
    this.client = client
    this.id = 10403
    this.version = 1
  }

  async decode() {
    // Read command type (501 MOVE, 503 SKILL, etc.)
    this.commandType = this.readInt()
    
    // Command data follows - will be read by handler
    // We don't read it here, pass the stream to CommandManager
    
    console.log(`[CommandExecuteMessage] Command type: ${this.commandType}`)
  }

  async process() {
    if (!this.client.player || !this.client.userObject) {
      console.log('[CommandExecuteMessage] Command failed: not authenticated')
      return
    }

    // Initialize player state if needed
    this.initializePlayerState()

    // Process command using CommandManager
    const manager = getCommandManager()
    
    // Create a copy of the stream at current offset for the handler
    // The handler will read command-specific data
    const commandData = this.buffer.slice(this.offset)
    
    // Process the command
    const result = await manager.processCommand(
      this.commandType,
      this.client,
      this
    )

    if (result.success) {
      console.log(`[CommandExecuteMessage] Command ${this.commandType} executed successfully`)
      
      // For commands without broadcast, DON'T send anything
      // Client moves locally and doesn't need server response
      // This is for single-player / client-side prediction mode
    } else {
      console.log(`[CommandExecuteMessage] Command ${this.commandType} failed: ${result.error}`)
      // NO direct response - client will timeout if expecting acknowledgment
      // The client doesn't expect 20403 response
    }
  }

  initializePlayerState() {
    if (!this.client.player.resources) {
      this.client.player.resources = {
        health: 100, maxHealth: 100,
        mana: 100, maxMana: 100,
        energy: 100, maxEnergy: 100,
        stamina: 100, maxStamina: 100
      }
    }

    if (!this.client.player.stats) {
      this.client.player.stats = {
        strength: 10, intelligence: 10, dexterity: 10, vitality: 10
      }
    }

    if (!this.client.player.position) {
      this.client.player.position = { x: 0, y: 0, layer: 0 }
    }

    if (!this.client.player.buffs) {
      this.client.player.buffs = []
    }
  }

  /**
   * Broadcast commands to all clients via EndTurnMessage
   * @param {Command[]} commands
   */
  async broadcastCommands(commands) {
    try {
      const endTurnMsg = new EndTurnMessage(this.client)
      
      for (const cmd of commands) {
        endTurnMsg.addCommand(cmd)
      }
      
      // Send to this client (and would broadcast to others in multiplayer)
      await endTurnMsg.send()
    } catch (err) {
      console.error('[CommandExecuteMessage] Error broadcasting commands:', err)
    }
  }
}

module.exports = CommandExecuteMessage
