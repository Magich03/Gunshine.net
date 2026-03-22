const Command = require('./Command')

/**
 * AddPlayerCommand (type 16)
 * 
 * Sent by server to spawn a player in the game world
 * Matches client's class_188 structure
 * 
 * This is NOT a regular game command - it's special for player spawning
 * 
 * Encoding:
 * - boolean hasAvatar
 * - if true: full avatar data (class_76)
 * - executeTick (int) [from base]
 */
class AddPlayerCommand extends Command {
  constructor(playerData = {}) {
    super()
    this.playerData = playerData
  }

  getCommandType() {
    return 16 // COMMAND_TYPE_ADD_PLAYER
  }

  encode(stream) {
    // boolean: hasAvatar
    stream.writeBoolean(true)
    
    // Full class_76 avatar data
    this.encodeAvatarData(stream, this.playerData)
    
    // Base command data: executeTick
    super.encode(stream)
  }

  /**
   * Encode full class_76 avatar data (player character)
   * Matches client's class_76 decode order
   */
  encodeAvatarData(stream, playerData) {
    // ========================================
    // class_75 (base avatar)
    // ========================================
    
    // 1. CharacterData globalID
    // Table 2 (characters.csv) player characters: 2097199-2097204
    stream.writeInt(playerData.characterDataId || 2097199)
    
    // 2. SkillSystem (class_385) - 3 skill bars
    stream.writeInt(0) // skillbar 0: 0 skills
    stream.writeInt(0) // skillbar 1: 0 skills
    stream.writeInt(0) // skillbar 2: 0 skills
    stream.writeInt(-1) // activeSkillBarIndex
    stream.writeInt(0) // remainingGlobalCoolDown
    stream.writeInt(0) // maxGlobalCoolDown
    stream.writeInt(0) // cooldowns count
    
    // 3. BuffSystem (class_384)
    stream.writeInt(0) // 0 buffs
    
    // 4. Inventory (class_400 -> class_399 -> class_68)
    // Materials bag
    stream.writeInt(0)
    
    // Game money
    stream.writeInt(playerData.resources?.money || 100)
    
    // Diamonds
    stream.writeInt(0)
    
    // Ingredients (11 ints)
    for (let i = 0; i < 11; i++) {
      stream.writeInt(0)
    }
    
    // Equipment bag (14 slots)
    stream.writeInt(14)
    for (let i = 0; i < 14; i++) {
      stream.writeInt(0) // empty slot
    }
    
    // isMeleeEquipped
    stream.writeBoolean(true)
    
    // Regular bag (20 slots)
    stream.writeInt(20)
    for (let i = 0; i < 20; i++) {
      stream.writeInt(0) // empty slot
    }
    
    // 5. Attributes (class_375 -> class_87 -> class_86)
    stream.writeInt(playerData.level || 1) // expLevel
    stream.writeInt((playerData.resources?.health || 100) << 10) // health * 1024
    stream.writeInt((playerData.resources?.energy || 100) << 10) // energy * 1024
    stream.writeInt(0) // var_95 total XP
    stream.writeInt(0) // var_86 current XP
    stream.writeInt(0) // specialization ID
    stream.writeInt(0) // var_283 spec rank
    stream.writeInt(0) // var_66 spec XP
    stream.writeInt(0) // var_897 flags
    
    // ========================================
    // class_76 (player-specific)
    // ========================================
    
    // 6. Player ID (long = 2 ints)
    stream.writeInt(playerData.idHigh || 0) // high
    stream.writeInt(playerData.idLow || 1) // low - MUST NOT BE 0
    
    // 7. Player Name
    stream.writeString(playerData.name || "Player")
    
    // 8. Facebook ID (null)
    stream.writeString(null)
    
    // 9. Tutorial BitList (64 bits = 2 ints)
    stream.writeInt(0)
    stream.writeInt(0)
    
    // 10. Flags
    stream.writeInt(0)
    
    // 11. Daily Reward Collected
    stream.writeBoolean(false)
    
    // 12. Daily Reward Day
    stream.writeInt(0)
    
    // 13. MissionSystem (class_50)
    stream.writeInt(0) // 0 active missions
    // Completed missions BitList: 48 ints
    for (let i = 0; i < 48; i++) {
      stream.writeInt(0)
    }
    stream.writeInt(0) // 0 daily mission cooldowns
    
    // 14. Visited Levels BitList: 7 ints
    for (let i = 0; i < 7; i++) {
      stream.writeInt(0)
    }
    
    // 15. Achievements BitList: 2 ints
    for (let i = 0; i < 2; i++) {
      stream.writeInt(0)
    }
    
    // 16. Specializations (class_383)
    stream.writeBoolean(false) // no specialization
    stream.writeInt(0) // reSpecCount
    
    // 17. KnownSkills (class_382)
    stream.writeInt(0) // 0 known skills
    
    // 18. Party (class_97)
    stream.writeInt(0) // 0 party members
    
    // 19. Mail Attachments (Vector.<int>)
    stream.writeBoolean(false) // null array
    
    // 20. Mercenary Avatar
    stream.writeBoolean(false) // no mercenary
    
    // 21. Crafting Bot globalID
    stream.writeInt(0)
    
    // 22. Achievements (class_392) - 2 fixed slots
    stream.writeBoolean(false) // slot 0 empty
    stream.writeBoolean(false) // slot 1 empty
    
    // 23. Travel Type (3 ints)
    stream.writeInt(0)
    stream.writeInt(0)
    stream.writeInt(0)
    
    // 24. Home Level globalID
    // Table 16 (levels.csv), row 207 = Northern Harbor
    stream.writeInt(16777423) // (16 << 20) + 207
    
    // 25. Timestamps (2 ints)
    const now = Math.floor(Date.now() / 1000)
    stream.writeInt(now)
    stream.writeInt(now)
    
    // 26. Version
    stream.writeInt(0)
  }

  static decode(stream) {
    // This would be used if server needed to decode AddPlayerCommand from client
    // Not typically used, but here for completeness
    const hasAvatar = stream.readBoolean()
    const cmd = new AddPlayerCommand()
    cmd.decode(stream)
    return cmd
  }
}

module.exports = AddPlayerCommand
