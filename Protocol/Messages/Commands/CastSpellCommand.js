const Command = require('../../Command')

class CastSpellCommand extends Command {
  constructor(client, data) {
    super(client, data)
    this.id = 1003
    this.name = 'CastSpell'
    this.spells = {
      fireball: { mana: 20, minDamage: 15, maxDamage: 35 },
      heal: { mana: 15, minHeal: 10, maxHeal: 25 },
      shield: { mana: 10, minShield: 10, maxShield: 20, duration: 30 },
      teleport: { mana: 25 }
    }
  }

  validate() {
    if (!super.validate()) return false
    if (!this.data.spellName || !this.spells[this.data.spellName]) return false
    const cost = this.spells[this.data.spellName].mana
    if (!this.hasResource('mana', cost)) return false
    return true
  }

  async execute() {
    const spell = this.spells[this.data.spellName]
    this.consumeResource('mana', spell.mana)
    this.recordCommand()

    let result = {}

    if (this.data.spellName === 'fireball') {
      result = {
        type: 'damage',
        value: Math.floor(Math.random() * (spell.maxDamage - spell.minDamage + 1)) + spell.minDamage,
        areaRadius: 5
      }
    } else if (this.data.spellName === 'heal') {
      const healAmount = Math.floor(Math.random() * (spell.maxHeal - spell.minHeal + 1)) + spell.minHeal
      this.addResource('health', healAmount)
      this.clampResource('health')
      result = {
        type: 'heal',
        value: healAmount,
        healthRemaining: this.client.player.resources.health
      }
    } else if (this.data.spellName === 'shield') {
      const shieldValue = Math.floor(Math.random() * (spell.maxShield - spell.minShield + 1)) + spell.minShield
      if (!this.client.player.buffs) this.client.player.buffs = []
      this.client.player.buffs.push({
        name: 'shield',
        value: shieldValue,
        expiresAt: Date.now() + (spell.duration * 1000)
      })
      result = {
        type: 'shield',
        value: shieldValue,
        duration: spell.duration
      }
    } else if (this.data.spellName === 'teleport') {
      const oldPos = { x: this.client.player.position?.x || 0, y: this.client.player.position?.y || 0 }
      this.client.player.position = {
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 1000)
      }
      result = {
        type: 'teleport',
        from: oldPos,
        to: this.client.player.position
      }
    }

    return {
      success: true,
      spell: this.data.spellName,
      manaCost: spell.mana,
      manaRemaining: this.client.player.resources.mana,
      result
    }
  }
}

module.exports = CastSpellCommand
