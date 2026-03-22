/**
 * Buff/Debuff System
 * Manages buffs and debuffs with expiration, effects, and cleanup
 */
class BuffDebuffSystem {
  constructor() {
    this.buffTypes = {
      shield: {
        type: 'buff',
        category: 'defense',
        description: 'Reduces incoming damage'
      },
      haste: {
        type: 'buff',
        category: 'offense',
        description: 'Increases attack speed'
      },
      strength_boost: {
        type: 'buff',
        category: 'stat',
        description: 'Increases strength'
      },
      poison: {
        type: 'debuff',
        category: 'damage',
        description: 'Takes damage over time'
      },
      slow: {
        type: 'debuff',
        category: 'control',
        description: 'Decreases movement speed'
      },
      stun: {
        type: 'debuff',
        category: 'control',
        description: 'Prevents action'
      }
    }

    this.tickInterval = 1000 // 1 second per tick
    this.timers = new Map() // clientId -> timeoutId
  }

  /**
   * Add a buff/debuff to a player
   */
  addBuff(client, buffName, options = {}) {
    if (!client?.player) return null

    const buffType = this.buffTypes[buffName]
    if (!buffType) {
      console.error(`Unknown buff type: ${buffName}`)
      return null
    }

    if (!client.player.buffs) {
      client.player.buffs = []
    }

    const buff = {
      id: Date.now() + Math.random(),
      name: buffName,
      type: buffType.type,
      category: buffType.category,
      value: options.value || 0,
      duration: options.duration || 30, // seconds
      expiresAt: Date.now() + ((options.duration || 30) * 1000),
      appliedAt: Date.now(),
      stacks: options.stacks || 1,
      ...options // Allow override of any property
    }

    client.player.buffs.push(buff)

    // Start cleanup ticker if not running
    this.startBuffTicker(client)

    return buff
  }

  /**
   * Remove a buff by ID
   */
  removeBuff(client, buffId) {
    if (!client?.player?.buffs) return false

    const index = client.player.buffs.findIndex(b => b.id === buffId)
    if (index !== -1) {
      client.player.buffs.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Remove all buffs of a specific type
   */
  removeBuffsByName(client, buffName) {
    if (!client?.player?.buffs) return 0

    const beforeCount = client.player.buffs.length
    client.player.buffs = client.player.buffs.filter(b => b.name !== buffName)
    return beforeCount - client.player.buffs.length
  }

  /**
   * Get active buffs of a specific type
   */
  getActiveBuffs(client, buffName = null) {
    if (!client?.player?.buffs) return []

    const now = Date.now()
    let active = client.player.buffs.filter(b => b.expiresAt > now)

    if (buffName) {
      active = active.filter(b => b.name === buffName)
    }

    return active
  }

  /**
   * Check if player has a specific buff
   */
  hasBuff(client, buffName) {
    return this.getActiveBuffs(client, buffName).length > 0
  }

  /**
   * Get total stacked value of a buff type
   */
  getTotalBuffValue(client, buffName) {
    return this.getActiveBuffs(client, buffName).reduce((sum, buff) => sum + buff.value, 0)
  }

  /**
   * Apply buff effects to player stats/resources
   */
  applyBuffEffects(client) {
    if (!client?.player) return

    const activeBuffs = this.getActiveBuffs(client)
    if (!activeBuffs.length) return

    // Calculate stat modifiers from buffs
    let statModifiers = {
      strength: 0,
      intelligence: 0,
      dexterity: 0,
      vitality: 0
    }

    let resourceModifiers = {
      maxHealth: 0,
      maxMana: 0,
      maxStamina: 0,
      maxEnergy: 0
    }

    activeBuffs.forEach(buff => {
      switch (buff.name) {
        case 'strength_boost':
          statModifiers.strength += buff.value
          break
        case 'intelligence_boost':
          statModifiers.intelligence += buff.value
          break
        case 'dexterity_boost':
          statModifiers.dexterity += buff.value
          break
        case 'vitality_boost':
          statModifiers.vitality += buff.value
          break
        case 'shield':
          resourceModifiers.maxHealth += buff.value
          break
        case 'poison':
          // Poison damage handled in combat system
          break
        case 'slow':
          // Movement speed reduction handled in movement system
          break
      }
    })

    // Apply modifiers (store modifiers separately from base stats)
    if (!client.player.buffModifiers) {
      client.player.buffModifiers = {}
    }
    client.player.buffModifiers.stats = statModifiers
    client.player.buffModifiers.resources = resourceModifiers
  }

  /**
   * Start buff ticker for a player
   */
  startBuffTicker(client) {
    if (!client?.player) return

    const clientId = `${client.player.highId}:${client.player.lowId}`
    
    // If ticker already running, don't start another
    if (this.timers.has(clientId)) {
      return
    }

    const timerId = setInterval(() => {
      this.cleanupExpiredBuffs(client)
      this.applyBuffEffects(client)
    }, this.tickInterval)

    this.timers.set(clientId, timerId)
  }

  /**
   * Stop buff ticker for a player
   */
  stopBuffTicker(client) {
    if (!client?.player) return

    const clientId = `${client.player.highId}:${client.player.lowId}`
    
    if (this.timers.has(clientId)) {
      clearInterval(this.timers.get(clientId))
      this.timers.delete(clientId)
    }
  }

  /**
   * Remove expired buffs from a player
   */
  cleanupExpiredBuffs(client) {
    if (!client?.player?.buffs) return

    const now = Date.now()
    const beforeCount = client.player.buffs.length
    
    client.player.buffs = client.player.buffs.filter(buff => {
      if (buff.expiresAt <= now) {
        // Optional: trigger buff expiration callback
        return false
      }
      return true
    })

    // If buffs were removed, apply effects
    if (client.player.buffs.length < beforeCount) {
      this.applyBuffEffects(client)
    }
  }

  /**
   * Get detailed buff information for client display
   */
  getBuffInfo(client) {
    if (!client?.player?.buffs) return []

    const now = Date.now()
    return client.player.buffs
      .filter(b => b.expiresAt > now)
      .map(b => ({
        id: b.id,
        name: b.name,
        type: b.type,
        value: b.value,
        remainingTime: Math.max(0, Math.floor((b.expiresAt - now) / 1000)),
        duration: b.duration,
        stacks: b.stacks
      }))
  }
}

// Singleton instance
let instance = null

module.exports = {
  getInstance: () => {
    if (!instance) instance = new BuffDebuffSystem()
    return instance
  },
  BuffDebuffSystem
}
