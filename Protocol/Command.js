/**
 * Base Command Handler
 * All commands extend this class to avoid code duplication
 */
class Command {
  constructor(client, data) {
    this.client = client
    this.data = data || {}
    this.id = 0
    this.name = 'Unknown'
  }

  validate() {
    if (!this.client?.player) return false
    return true
  }

  async execute() {
    throw new Error('execute() must be implemented')
  }

  hasResource(type, amount) {
    return (this.client.player.resources?.[type] || 0) >= amount
  }

  consumeResource(type, amount) {
    if (!this.client.player.resources) this.client.player.resources = {}
    this.client.player.resources[type] = (this.client.player.resources[type] || 0) - amount
  }

  addResource(type, amount) {
    if (!this.client.player.resources) this.client.player.resources = {}
    this.client.player.resources[type] = (this.client.player.resources[type] || 0) + amount
  }

  clampResource(type) {
    const max = this.client.player.resources?.[`max${type.charAt(0).toUpperCase() + type.slice(1)}`]
    if (max && this.client.player.resources[type] > max) {
      this.client.player.resources[type] = max
    }
  }

  recordCommand() {
    if (!this.client.player.commandHistory) {
      this.client.player.commandHistory = []
    }
    this.client.player.commandHistory.push({
      id: this.id,
      name: this.name,
      timestamp: Date.now(),
      data: this.data
    })
    if (this.client.player.commandHistory.length > 100) {
      this.client.player.commandHistory.shift()
    }
  }
}

module.exports = Command
