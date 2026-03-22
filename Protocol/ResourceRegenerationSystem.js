/**
 * Resource Regeneration System
 * Handles automatic regeneration of player resources based on stats
 */
class ResourceRegenerationSystem {
  constructor() {
    this.regenerationRates = {
      health: {
        basePer5s: 2,
        scaleStat: 'vitality',
        scaleMultiplier: 0.1
      },
      mana: {
        basePer5s: 3,
        scaleStat: 'intelligence',
        scaleMultiplier: 0.15
      },
      stamina: {
        basePer5s: 5,
        scaleStat: 'strength',
        scaleMultiplier: 0.1
      },
      energy: {
        basePer5s: 4,
        scaleStat: 'dexterity',
        scaleMultiplier: 0.12
      }
    }

    this.regenerationTickInterval = 5000 // 5 seconds per tick
    this.timers = new Map() // clientId -> timeoutId
  }

  /**
   * Start regeneration for a player
   */
  startRegeneration(client) {
    if (!client?.player) return

    const clientId = `${client.player.highId}:${client.player.lowId}`
    
    // Clear existing timer if any
    if (this.timers.has(clientId)) {
      clearInterval(this.timers.get(clientId))
    }

    // Start regeneration interval
    const timerId = setInterval(() => {
      this.regenerateResources(client)
    }, this.regenerationTickInterval)

    this.timers.set(clientId, timerId)
  }

  /**
   * Stop regeneration for a player
   */
  stopRegeneration(client) {
    if (!client?.player) return

    const clientId = `${client.player.highId}:${client.player.lowId}`
    
    if (this.timers.has(clientId)) {
      clearInterval(this.timers.get(clientId))
      this.timers.delete(clientId)
    }
  }

  /**
   * Regenerate all resources for a player
   */
  regenerateResources(client) {
    if (!client?.player?.resources || !client.player.stats) return

    const resources = client.player.resources
    const stats = client.player.stats

    // Regenerate each resource
    for (const [resourceType, rateInfo] of Object.entries(this.regenerationRates)) {
      if (resourceType === 'health' || resourceType === 'mana' || 
          resourceType === 'stamina' || resourceType === 'energy') {
        
        const maxResource = resources[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`]
        if (maxResource && resources[resourceType] < maxResource) {
          // Calculate regeneration: base + (stat * multiplier)
          const statValue = stats[rateInfo.scaleStat] || 0
          const regen = rateInfo.basePer5s + (statValue * rateInfo.scaleMultiplier)
          
          // Add regeneration and clamp to max
          resources[resourceType] = Math.min(
            resources[resourceType] + regen,
            maxResource
          )
        }
      }
    }
  }

  /**
   * Manually add to a resource (with max clamping)
   */
  addResource(client, resourceType, amount) {
    if (!client?.player?.resources) return 0

    const maxResource = client.player.resources[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`]
    const newValue = client.player.resources[resourceType] + amount

    if (maxResource) {
      client.player.resources[resourceType] = Math.min(newValue, maxResource)
    } else {
      client.player.resources[resourceType] = newValue
    }

    return client.player.resources[resourceType]
  }

  /**
   * Deduct from a resource
   */
  deductResource(client, resourceType, amount) {
    if (!client?.player?.resources) return 0

    client.player.resources[resourceType] = Math.max(
      client.player.resources[resourceType] - amount,
      0
    )

    return client.player.resources[resourceType]
  }

  /**
   * Check if player has enough of a resource
   */
  hasResource(client, resourceType, amount) {
    if (!client?.player?.resources) return false
    return (client.player.resources[resourceType] || 0) >= amount
  }
}

// Singleton instance
let instance = null

module.exports = {
  getInstance: () => {
    if (!instance) instance = new ResourceRegenerationSystem()
    return instance
  },
  ResourceRegenerationSystem
}
