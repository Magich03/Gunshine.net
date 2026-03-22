/**
 * Simple Player Storage - In-Memory (No MongoDB dependency)
 * For production, replace with actual database
 */
class PlayerStorage {
  constructor() {
    this.players = new Map() // playerId -> playerData
  }

  /**
   * Get player by ID
   */
  getPlayer(highId, lowId) {
    const key = `${highId}:${lowId}`
    if (!this.players.has(key)) {
      this.players.set(key, this.createNewPlayer(highId, lowId))
    }
    return this.players.get(key)
  }

  /**
   * Save player data
   */
  savePlayer(highId, lowId, playerData) {
    const key = `${highId}:${lowId}`
    this.players.set(key, playerData)
    return playerData
  }

  /**
   * Create default player object
   */
  createNewPlayer(highId, lowId) {
    return {
      highId,
      lowId,
      name: 'Player',
      position: { x: 0, y: 0 },
      resources: {
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        energy: 100,
        maxEnergy: 100,
        stamina: 100,
        maxStamina: 100
      },
      stats: {
        strength: 10,
        intelligence: 10,
        dexterity: 10,
        vitality: 10
      },
      buffs: [],
      commandHistory: [],
      createdAt: Date.now(),
      lastUpdated: Date.now()
    }
  }

  /**
   * Get all players
   */
  getAllPlayers() {
    return Array.from(this.players.values())
  }

  /**
   * Delete player
   */
  deletePlayer(highId, lowId) {
    const key = `${highId}:${lowId}`
    return this.players.delete(key)
  }
}

// Singleton instance
let instance = null

module.exports = {
  getInstance: () => {
    if (!instance) instance = new PlayerStorage()
    return instance
  },
  PlayerStorage
}
