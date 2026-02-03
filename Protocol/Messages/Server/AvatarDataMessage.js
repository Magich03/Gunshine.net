const PiranhaMessage = require('../../PiranhaMessage')

/**
 * AvatarDataMessage (20203)
 * 
 * Sent to client to trigger the game loading after avatar is set.
 * Contains a complete class_76 player avatar.
 * 
 * Client class: package_42.class_166
 * 
 * This message triggers method_1617() which calls method_706() 
 * to actually load the player into the game.
 */
class AvatarDataMessage extends PiranhaMessage {
  constructor(client, playerData) {
    super()
    this.id = 20203
    this.client = client
    this.version = 0
    this.playerData = playerData || {}
  }

  async encode() {
    const playerData = this.playerData
    
    // ========================================
    // class_75 (base avatar) - super.decode()
    // ========================================
    
    // 1. CharacterData globalID
    // GlobalID = (tableIndex << 20) | rowIndex
    // Table 2 (characters.csv) has player characters at rows 47-52:
    // 2097199 = MalePlayerConstructionWorker (Tank)
    // 2097200 = MalePlayerDoctor (Healer)
    // 2097201 = MalePlayerDeerHunter (Damage)
    // 2097202 = FemalePlayerMarine (Tank)
    // 2097203 = FemalePlayerDoctor (Healer)
    // 2097204 = FemalePlayerDeerHunter (Damage)
    this.writeInt(playerData.characterDataId || 2097199)
    
    // 2. SkillSystem (class_385)
    // 3 skill bars, each with 0 skills
    this.writeInt(0) // skillbar 0: 0 skills
    this.writeInt(0) // skillbar 1: 0 skills
    this.writeInt(0) // skillbar 2: 0 skills
    this.writeInt(-1) // activeSkillBarIndex
    this.writeInt(0) // remainingGlobalCoolDown
    this.writeInt(0) // maxGlobalCoolDown
    this.writeInt(0) // cooldowns count
    
    // 3. BuffSystem (class_384)
    this.writeInt(0) // 0 buffs
    
    // 4. Inventory (class_400 -> class_399 -> class_68)
    // Decode order in class_400.decode():
    // 1. var_610.decode() (materials bag)
    // 2. var_550 (gameMoney)
    // 3. var_188 (diamonds)
    // 4. var_163 (ingredients - 330 ints)
    // 5. super.decode() -> class_399.decode():
    //    a. var_135.decode() (equipment bag - 14 slots)
    //    b. var_65 (isMeleeEquipped boolean)
    //    c. super.decode() -> class_68.decode():
    //       - var_121.decode() (regular bag)
    
    // Materials bag (var_610): 0 slots for now
    this.writeInt(0)
    
    // Game money (var_550)
    this.writeInt(100)
    
    // Diamonds (var_188)
    this.writeInt(0)
    
    // Ingredients (var_163): 11 ints (11 named ingredient items in ingredients.csv)
    // Note: ingredients.csv has 330 rows but only 11 unique ingredients (each with level sub-rows)
    for (let i = 0; i < 11; i++) {
      this.writeInt(0)
    }
    
    // Equipment bag (var_135): 14 slots (prop_classes.csv row count)
    // Each empty slot is just a 0 (null item globalID)
    this.writeInt(14)
    for (let i = 0; i < 14; i++) {
      this.writeInt(0) // empty slot: null item globalID
    }
    
    // isMeleeEquipped (var_65)
    this.writeBoolean(true)
    
    // Regular bag (var_121): 20 slots
    this.writeInt(20)
    for (let i = 0; i < 20; i++) {
      this.writeInt(0) // empty slot: null item globalID
    }
    
    // 5. Attributes (class_375 -> class_87 -> class_86)
    this.writeInt(1) // expLevel
    this.writeInt(100 << 10) // health (100 * 1024)
    // isAlive() = true, so no death boolean needed
    this.writeInt(100 << 10) // energy (100 * 1024)
    this.writeInt(0) // var_95 total XP
    this.writeInt(0) // var_86 current XP
    this.writeInt(0) // specialization ID
    this.writeInt(0) // var_283 spec rank
    this.writeInt(0) // var_66 spec XP
    this.writeInt(0) // var_897 flags
    
    // ========================================
    // class_76 (player-specific)
    // ========================================
    
    // 6. Player ID (long = 2 ints)
    this.writeInt(playerData.idHigh || 0) // high
    this.writeInt(playerData.idLow || 1) // low - MUST NOT BE 0!
    
    // 7. Player Name
    this.writeString(playerData.name || "Player")
    
    // 8. Facebook ID (null)
    this.writeString(null)
    
    // 9. Tutorial BitList (64 bits = 2 ints)
    this.writeInt(0)
    this.writeInt(0)
    
    // 10. Flags
    this.writeInt(0)
    
    // 11. Daily Reward Collected
    this.writeBoolean(false)
    
    // 12. Daily Reward Day
    this.writeInt(0)
    
    // 13. MissionSystem (class_50)
    this.writeInt(0) // 0 active missions
    // Completed missions BitList: 48 ints
    for (let i = 0; i < 48; i++) {
      this.writeInt(0)
    }
    this.writeInt(0) // 0 daily mission cooldowns
    
    // 14. Visited Levels BitList: 7 ints
    for (let i = 0; i < 7; i++) {
      this.writeInt(0)
    }
    
    // 15. Achievements BitList: 2 ints
    for (let i = 0; i < 2; i++) {
      this.writeInt(0)
    }
    
    // 16. Specializations (class_383)
    this.writeBoolean(false) // no specialization
    this.writeInt(0) // reSpecCount
    
    // 17. KnownSkills (class_382)
    this.writeInt(0) // 0 known skills
    
    // 18. Party (class_97)
    this.writeInt(0) // 0 party members
    
    // 19. Mail Attachments (Vector.<int>)
    this.writeBoolean(false) // null array
    
    // 20. Mercenary Avatar
    this.writeBoolean(false) // no mercenary
    
    // 21. Crafting Bot globalID
    this.writeInt(0)
    
    // 22. Achievements (class_392) - 2 fixed slots
    this.writeBoolean(false) // slot 0 empty
    this.writeBoolean(false) // slot 1 empty
    
    // 23. Travel Type (3 ints)
    this.writeInt(0)
    this.writeInt(0)
    this.writeInt(0)
    
    // 24. Home Level globalID
    // GlobalID = (tableIndex << 20) | rowIndex
    // Table 16 (levels.csv), row 207 = Northern Harbor (IsStartupLevel=TRUE)
    // globalID = (16 << 20) + 207 = 16777216 + 207 = 16777423
    this.writeInt(16777423)
    
    // 25. Timestamps (2 ints)
    const now = Math.floor(Date.now() / 1000)
    this.writeInt(now)
    this.writeInt(now)
    
    // 26. Version
    this.writeInt(0)
  }
}

module.exports = AvatarDataMessage