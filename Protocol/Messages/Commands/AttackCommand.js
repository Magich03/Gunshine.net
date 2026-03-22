const Command = require('../../Command')

class AttackCommand extends Command {
  constructor(client, data) {
    super(client, data)
    this.id = 1002
    this.name = 'Attack'
  }

  validate() {
    if (!super.validate()) return false
    if (typeof this.data.targetId !== 'number') return false
    if (!this.hasResource('stamina', 5)) return false
    return true
  }

  async execute() {
    const baseDamage = Math.floor(Math.random() * 10) + 5
    const strength = this.client.player.stats?.strength || 0
    const damage = baseDamage + Math.floor(strength * 0.1)
    const isCritical = Math.random() < 0.2

    this.consumeResource('stamina', 5)
    this.recordCommand()

    return {
      success: true,
      targetId: this.data.targetId,
      damage: isCritical ? Math.floor(damage * 1.5) : damage,
      isCritical,
      staminaRemaining: this.client.player.resources.stamina
    }
  }
}

module.exports = AttackCommand
