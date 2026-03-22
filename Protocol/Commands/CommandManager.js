const fs = require('fs')
const path = require('path')

/**
 * CommandManager
 * 
 * Routes client commands (501 MOVE, 503 SKILL, etc.) to appropriate handlers.
 * Auto-discovers handlers from Client/ folder.
 */
class CommandManager {
  constructor() {
    this.handlers = new Map()
    this.loadHandlers()
  }

  /**
   * Load all command handlers from Client/ folder
   */
  loadHandlers() {
    const handlersDir = path.join(__dirname, 'Client')
    
    if (!fs.existsSync(handlersDir)) {
      console.log('[CommandManager] Handlers directory does not exist')
      return
    }

    const files = fs.readdirSync(handlersDir)
    
    for (const file of files) {
      if (!file.endsWith('CommandHandler.js')) continue
      if (file === 'CommandHandler.js') continue // Skip base class

      try {
        const HandlerClass = require(path.join(handlersDir, file))
        const handler = new HandlerClass()
        const commandType = handler.getCommandType()
        
        this.handlers.set(commandType, handler)
        console.log(`[CommandManager] Loaded: ${file} (type ${commandType})`)
      } catch (err) {
        console.error(`[CommandManager] Failed to load ${file}:`, err.message)
      }
    }

    console.log(`[CommandManager] Loaded ${this.handlers.size} command handlers`)
  }

  /**
   * Get handler for a command type
   * @param {number} commandType
   * @returns {CommandHandler|null}
   */
  getHandler(commandType) {
    return this.handlers.get(commandType) || null
  }

  /**
   * Process a command from client
   * @param {number} commandType - Command type ID (501, 502, 503, etc.)
   * @param {Object} client - Client connection
   * @param {ByteStream} stream - ByteStream with command data
   * @returns {Object} Result: { success, error?, commands? }
   */
  async processCommand(commandType, client, stream) {
    const handler = this.getHandler(commandType)
    
    if (!handler) {
      console.log(`[CommandManager] No handler for command type ${commandType}`)
      return { success: false, error: `Unknown command type: ${commandType}` }
    }

    try {
      return await handler.handle(client, stream)
    } catch (err) {
      console.error(`[CommandManager] Error processing command ${commandType}:`, err)
      return { success: false, error: 'Processing error' }
    }
  }
}

// Singleton instance
let instance = null

function getInstance() {
  if (!instance) {
    instance = new CommandManager()
  }
  return instance
}

module.exports = { getInstance }
