const PiranhaMessage = require('../../PiranhaMessage')
const { getInstance: getCommandRegistry } = require('../../CommandRegistry')
const CommandResultMessage = require('../Server/CommandResultMessage')

/**
 * CommandExecuteMessage (ID: 10403)
 * Client sends commands through this message
 */
class CommandExecuteMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes)
    this.client = client
    this.id = 10403
    this.version = 1
  }

  async decode() {
    this.data = {}
    this.data.commandId = this.readInt()
    
    // Read command data as JSON
    try {
      const jsonStr = this.readString()
      this.data.parameters = JSON.parse(jsonStr)
    } catch (e) {
      this.data.parameters = {}
    }

    this.client.log(`[CommandExecuteMessage] Command ID: ${this.data.commandId}, Params:`, this.data.parameters)
  }

  async process() {
    if (!this.client.player || !this.client.userObject) {
      this.client.log('Command failed: not authenticated')
      return
    }

    // Initialize player state if needed
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
      this.client.player.position = { x: 0, y: 0 }
    }

    if (!this.client.player.buffs) {
      this.client.player.buffs = []
    }

    // Execute command
    const registry = getCommandRegistry()
    const result = await registry.execute(
      this.data.commandId,
      this.client,
      this.data.parameters
    )

    // Send simple acknowledgment response (message 20403 equivalent)
    // Just echo back success status and minimal data
    await this.sendCommandAck(result)
  }

  async sendCommandAck(result) {
    try {
      // Use proper CommandResultMessage instead of manual ByteStream
      const resultMsg = new CommandResultMessage(this.client, {
        commandId: this.data.commandId,
        success: result.success,
        error: result.error || null,
        data: result.data || {}
      })
      
      // Use base class send() which handles encryption properly
      resultMsg.send()
      
      this.client.log(`[CommandExecuteMessage] Sent result message for command ${this.data.commandId}`)
    } catch (err) {
      console.error('Error sending command result:', err)
    }
  }
}

module.exports = CommandExecuteMessage
