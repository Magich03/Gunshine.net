const Command = require('../../Command')
const { getInstance: getValidationUtilities } = require('../../ValidationUtilities')

class MoveCommand extends Command {
  constructor(client, data) {
    super(client, data)
    this.id = 1001
    this.name = 'Move'
    this.cooldownSeconds = 0.5
    this.maxMovementDistance = 50 // Units per move
  }

  validate() {
    if (!super.validate()) return false
    if (typeof this.data.x !== 'number' || typeof this.data.y !== 'number') return false
    if (this.data.x < 0 || this.data.x > 1000 || this.data.y < 0 || this.data.y > 1000) return false
    if (!this.hasResource('energy', 1)) return false
    
    // Check cooldown
    const validator = getValidationUtilities()
    const playerId = `${this.client.player.highId}:${this.client.player.lowId}`
    
    if (validator.isOnCooldown(playerId, this.id)) {
      return false
    }

    // Validate movement distance
    const currentPos = this.client.player.position || { x: 0, y: 0 }
    const distanceValidation = validator.validateDistance(
      currentPos.x,
      currentPos.y,
      this.data.x,
      this.data.y,
      this.maxMovementDistance
    )

    if (!distanceValidation.valid) {
      return false
    }

    return true
  }

  async execute() {
    const oldPos = { x: this.client.player.position?.x || 0, y: this.client.player.position?.y || 0 }
    this.client.player.position = { x: this.data.x, y: this.data.y }
    this.consumeResource('energy', 1)
    this.recordCommand()
    
    // Set cooldown for next move
    const validator = getValidationUtilities()
    const playerId = `${this.client.player.highId}:${this.client.player.lowId}`
    validator.setCooldown(playerId, this.id, this.cooldownSeconds)
    
    return {
      success: true,
      oldPosition: oldPos,
      newPosition: this.client.player.position,
      energyRemaining: this.client.player.resources.energy
    }
  }
}

module.exports = MoveCommand
