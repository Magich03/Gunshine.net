/**
 * Validation Utilities
 * Provides command validation helpers: cooldowns, permissions, rate limiting
 */
class ValidationUtilities {
  constructor() {
    this.commandCooldowns = new Map() // playerId -> { commandId -> expiresAt }
    this.rateLimits = new Map()       // playerId -> { action -> [timestamps] }
    this.permissions = new Map()      // playerId -> [permissionIds]
    this.playerLevels = new Map()     // playerId -> level
  }

  /**
   * Set player cooldown for a command
   */
  setCooldown(playerId, commandId, cooldownSeconds) {
    if (!this.commandCooldowns.has(playerId)) {
      this.commandCooldowns.set(playerId, {})
    }
    const cooldowns = this.commandCooldowns.get(playerId)
    cooldowns[commandId] = Date.now() + (cooldownSeconds * 1000)
  }

  /**
   * Check if a command is on cooldown
   */
  isOnCooldown(playerId, commandId) {
    const cooldowns = this.commandCooldowns.get(playerId)
    if (!cooldowns || !cooldowns[commandId]) return false
    
    if (Date.now() > cooldowns[commandId]) {
      delete cooldowns[commandId]
      return false
    }
    return true
  }

  /**
   * Get remaining cooldown time in seconds
   */
  getRemainingCooldown(playerId, commandId) {
    const cooldowns = this.commandCooldowns.get(playerId)
    if (!cooldowns || !cooldowns[commandId]) return 0
    
    const remaining = cooldowns[commandId] - Date.now()
    return Math.max(0, Math.ceil(remaining / 1000))
  }

  /**
   * Check rate limit (max N actions per time window)
   */
  checkRateLimit(playerId, action, maxAttempts = 10, windowSeconds = 60) {
    if (!this.rateLimits.has(playerId)) {
      this.rateLimits.set(playerId, {})
    }

    const rateLimits = this.rateLimits.get(playerId)
    if (!rateLimits[action]) {
      rateLimits[action] = []
    }

    const now = Date.now()
    const windowStart = now - (windowSeconds * 1000)

    // Remove old timestamps outside the window
    rateLimits[action] = rateLimits[action].filter(ts => ts > windowStart)

    // Check if limit exceeded
    if (rateLimits[action].length >= maxAttempts) {
      return {
        allowed: false,
        attemptsRemaining: 0,
        resetIn: Math.ceil((rateLimits[action][0] + (windowSeconds * 1000) - now) / 1000)
      }
    }

    // Add current timestamp
    rateLimits[action].push(now)

    return {
      allowed: true,
      attemptsRemaining: maxAttempts - rateLimits[action].length,
      resetIn: 0
    }
  }

  /**
   * Grant permission to player
   */
  grantPermission(playerId, permission) {
    if (!this.permissions.has(playerId)) {
      this.permissions.set(playerId, [])
    }
    const perms = this.permissions.get(playerId)
    if (!perms.includes(permission)) {
      perms.push(permission)
    }
  }

  /**
   * Revoke permission from player
   */
  revokePermission(playerId, permission) {
    const perms = this.permissions.get(playerId)
    if (perms) {
      const index = perms.indexOf(permission)
      if (index !== -1) {
        perms.splice(index, 1)
      }
    }
  }

  /**
   * Check if player has permission
   */
  hasPermission(playerId, permission) {
    const perms = this.permissions.get(playerId)
    if (!perms) return false
    return perms.includes(permission)
  }

  /**
   * Get all permissions for a player
   */
  getPermissions(playerId) {
    return this.permissions.get(playerId) || []
  }

  /**
   * Set player level
   */
  setPlayerLevel(playerId, level) {
    this.playerLevels.set(playerId, level)
  }

  /**
   * Get player level
   */
  getPlayerLevel(playerId) {
    return this.playerLevels.get(playerId) || 1
  }

  /**
   * Check if player meets level requirement
   */
  meetsLevelRequirement(playerId, requiredLevel) {
    const playerLevel = this.getPlayerLevel(playerId)
    return playerLevel >= requiredLevel
  }

  /**
   * Validate command parameters
   */
  validateCommandParams(params, schema) {
    for (const [key, type] of Object.entries(schema)) {
      if (!(key in params)) {
        return {
          valid: false,
          error: `Missing required parameter: ${key}`
        }
      }

      const value = params[key]
      const expectedType = Array.isArray(type) ? 'array' : typeof type

      if (expectedType === 'array') {
        if (!Array.isArray(value)) {
          return {
            valid: false,
            error: `Parameter ${key} must be an array`
          }
        }
        // Check array element types if specified
        if (type.length > 0) {
          const elementType = typeof type[0]
          for (const elem of value) {
            if (typeof elem !== elementType) {
              return {
                valid: false,
                error: `Array ${key} contains invalid element type`
              }
            }
          }
        }
      } else if (typeof value !== expectedType) {
        return {
          valid: false,
          error: `Parameter ${key} must be of type ${expectedType}, got ${typeof value}`
        }
      }
    }

    return { valid: true }
  }

  /**
   * Validate position is within game bounds
   */
  validatePosition(x, y, maxX = 1000, maxY = 1000) {
    if (typeof x !== 'number' || typeof y !== 'number') {
      return { valid: false, error: 'Position must be numeric' }
    }

    if (x < 0 || x > maxX || y < 0 || y > maxY) {
      return {
        valid: false,
        error: `Position out of bounds. Valid range: 0-${maxX}, 0-${maxY}`
      }
    }

    return { valid: true }
  }

  /**
   * Validate distance between two positions
   */
  validateDistance(x1, y1, x2, y2, maxDistance) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    
    if (distance > maxDistance) {
      return {
        valid: false,
        error: `Target is too far away (${Math.floor(distance)} units, max ${maxDistance})`
      }
    }

    return { valid: true, distance }
  }

  /**
   * Sanitize string input
   */
  sanitizeString(input, maxLength = 100) {
    if (typeof input !== 'string') return ''
    
    // Remove potential malicious characters
    let sanitized = input
      .slice(0, maxLength)
      .trim()
      .replace(/[<>\"']/g, '') // Remove HTML/script characters

    return sanitized
  }

  /**
   * Clear all cooldowns for a player (admin function)
   */
  clearCooldowns(playerId) {
    this.commandCooldowns.delete(playerId)
  }

  /**
   * Clear rate limit for a player (admin function)
   */
  clearRateLimit(playerId, action = null) {
    if (action) {
      const rateLimits = this.rateLimits.get(playerId)
      if (rateLimits) {
        delete rateLimits[action]
      }
    } else {
      this.rateLimits.delete(playerId)
    }
  }
}

// Singleton instance
let instance = null

module.exports = {
  getInstance: () => {
    if (!instance) instance = new ValidationUtilities()
    return instance
  },
  ValidationUtilities
}
