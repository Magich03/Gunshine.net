const fs = require('fs')
const path = require('path')

/**
 * Command Registry - Loads and manages all commands
 * No code duplication - all commands use this registry
 */
class CommandRegistry {
  constructor() {
    this.commands = new Map()
    this.loadCommands()
  }

  loadCommands() {
    const commandsDir = path.join(__dirname, 'Messages', 'Commands')
    
    if (!fs.existsSync(commandsDir)) {
      fs.mkdirSync(commandsDir, { recursive: true })
      return
    }

    fs.readdirSync(commandsDir).forEach(file => {
      if (file.endsWith('Command.js')) {
        try {
          const CommandClass = require(path.join(commandsDir, file))
          const instance = new CommandClass(null, {})
          this.commands.set(instance.id, CommandClass)
          console.log(`[CommandRegistry] Loaded: ${file} (ID: ${instance.id})`)
        } catch (err) {
          console.error(`[CommandRegistry] Error loading ${file}:`, err.message)
        }
      }
    })
  }

  async execute(commandId, client, data) {
    const CommandClass = this.commands.get(commandId)
    if (!CommandClass) {
      return { success: false, error: `Unknown command: ${commandId}` }
    }

    try {
      const command = new CommandClass(client, data)
      
      if (!command.validate()) {
        return { success: false, error: 'Command validation failed' }
      }

      const result = await command.execute()
      return result
    } catch (err) {
      console.error(`[CommandRegistry] Error executing command ${commandId}:`, err)
      return { success: false, error: err.message }
    }
  }

  getCommand(id) {
    return this.commands.get(id)
  }
}

// Singleton instance
let instance = null

module.exports = {
  getInstance: () => {
    if (!instance) instance = new CommandRegistry()
    return instance
  },
  CommandRegistry
}
