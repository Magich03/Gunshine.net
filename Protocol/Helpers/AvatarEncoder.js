/**
 * AvatarEncoder
 * 
 * Helper module to encode player avatar (class_76) and related structures
 * for the Gunshine.net protocol.
 * 
 * Based on decompiled client code from pistol/src/package_31/class_76.as
 */

class AvatarEncoder {
  /**
   * Encode a complete player avatar (class_76)
   * This is the main method called by CreatePlayerOkMessage
   * 
   * @param {ByteStream} stream - The ByteStream to write to
   * @param {Object} playerData - Player data object
   */
  static encodePlayerAvatar(stream, playerData) {
    // === class_75 (base avatar) super.decode() ===
    // 1. CharacterData globalID (int) - via class_305.method_46()
    stream.writeInt(playerData.characterDataId || 2097152); // Default character ID
    
    // 2. SkillSystem (class_385)
    this.encodeSkillSystem(stream);
    
    // 3. BuffSystem (class_384)
    this.encodeBuffSystem(stream);
    
    // 4. Inventory (class_400 for players - NOT just class_89!)
    // class_400 extends class_399 extends class_68
    this.encodePlayerInventory(stream, playerData.ingredientCount || 330);
    
    // 5. Attributes (class_375 for players - NOT just class_87!)
    this.encodePlayerAttributes(stream, playerData.level || 1, playerData.maxHealth || 100, playerData.maxEnergy || 100);
    
    // === class_76 (player-specific) decode() lines 494-558 ===
    
    // 6. Player ID (long - 2 ints via readLong())
    // IMPORTANT: Must not be [0,0] or client shows error "setCurrentAvatar is is 0"
    const idHigh = playerData.idHigh || 0;
    const idLow = playerData.idLow || 1;
    stream.writeLong(idHigh, idLow);
    
    // 7. Player Name (string)
    stream.writeString(playerData.name || "Player");
    
    // 8. Facebook ID (string, can be null/-1)
    stream.writeString(null); // null = -1 length
    
    // 9. Tutorial BitList (class_323 with 64 bits = 2 ints)
    this.encodeBitList(stream, 2); // 64 bits = 2 ints
    
    // 10. Flags int (var_1128)
    stream.writeInt(0);
    
    // 11. Daily Reward Collected (boolean)
    stream.writeBoolean(false);
    
    // 12. Daily Reward Day (int)
    stream.writeInt(0);
    
    // 13. MissionSystem (class_50)
    this.encodeMissionSystem(stream, playerData.missionBitListSize || 8);
    
    // 14. Visited Levels BitList (class_323 - size from game data)
    // Size = ceil(levelCount / 32), typically 8-16 ints for ~256-512 levels
    this.encodeBitList(stream, playerData.visitedLevelsBitListSize || 8);
    
    // 15. Second BitList (class_323 - size from game data)
    this.encodeBitList(stream, playerData.secondBitListSize || 8);
    
    // 16. Specializations (class_383)
    this.encodeSpecializations(stream);
    
    // 17. KnownSkills (class_382)
    this.encodeKnownSkills(stream);
    
    // 18. Party (class_97)
    this.encodeParty(stream);
    
    // 19. Mail Attachments (Vector.<int> via class_305.method_794)
    // writeBoolean(array != null); if not null: writeInt(length); for each: writeInt(value)
    stream.writeBoolean(false); // null array
    
    // 20. Mercenary Avatar (optional - boolean, then class_75 if true)
    stream.writeBoolean(false); // No mercenary
    
    // 21. Crafting Bot (class_104 globalID via class_305.method_46)
    stream.writeInt(0); // No crafting bot
    
    // 22. Achievements (class_392) - 2 fixed slots
    this.encodeAchievements(stream);
    
    // 23. Travel Type (3 ints: var_979, var_594, var_1057)
    stream.writeInt(0);
    stream.writeInt(0);
    stream.writeInt(0);
    
    // 24. Home Level (class_55 globalID via class_305.method_734)
    stream.writeInt(playerData.homeLevelId || 0);
    
    // 25. Timestamps (2 ints: var_1288, var_1036)
    const now = Math.floor(Date.now() / 1000);
    stream.writeInt(now);
    stream.writeInt(now);
    
    // 26. Version (int)
    stream.writeInt(0);
  }

  /**
   * Encode Player Inventory (class_400 extends class_399 extends class_68)
   * 
   * Decode order:
   * 1. class_400: var_610.decode() - materials bag (90 slots)
   * 2. class_400: var_550 = readInt()
   * 3. class_400: var_188 = readInt()
   * 4. class_400: var_163 = readInts(ingredientTableSize) - ingredient counts
   * 5. class_399: var_135.decode() - equipment bag (14 slots from prop_classes)
   * 6. class_399: var_65 = readBoolean()
   * 7. class_68: var_121.decode() - regular bag (15 slots for player)
   */
  static encodePlayerInventory(stream, ingredientCount) {
    // 1. class_400: var_610 (materials bag) - class_89 with 90 slots max
    // For empty bag, just write count 0 and no slots
    this.encodeEmptyBag(stream);
    
    // 2. class_400: var_550 (initial value is const_1544 = 100)
    stream.writeInt(100);
    
    // 3. class_400: var_188
    stream.writeInt(0);
    
    // 4. class_400: var_163 - ingredient counts array
    // Size is from class_128.getTable(class_128.const_22).getItemCount()
    // const_22 = 102 = ingredients table, which has ~330 items
    for (let i = 0; i < ingredientCount; i++) {
      stream.writeInt(0); // 0 of each ingredient
    }
    
    // 5. class_399: var_135 (equipment bag) - class_89
    // For empty bag, just write count 0 and no slots
    this.encodeEmptyBag(stream);
    
    // 6. class_399: var_65 (boolean - has free equipment slot)
    stream.writeBoolean(true); // true = has free slot
    
    // 7. class_68: var_121 (regular bag) - class_89
    // For empty bag, just write count 0 and no slots
    this.encodeEmptyBag(stream);
  }

  /**
   * Encode an empty Bag (class_89)
   * Just writes count 0 with no slot data
   */
  static encodeEmptyBag(stream) {
    stream.writeInt(0); // 0 slots
  }

  /**
   * Encode Player Attributes (class_375 extends class_87 extends class_86)
   * 
   * Decode order:
   * 1. class_87: expLevel = readInt()
   * 2. class_86: var_215 = readInt() (health << 10)
   * 3. class_87: if !isAlive(): var_1639 = readBoolean()
   * 4. class_87: var_491 = readInt() (energy << 10)
   * 5. class_375: var_95 = readInt() (total XP earned)
   * 6. class_375: var_86 = readInt() (current XP)
   * 7. class_375: int (specialization ID)
   * 8. class_375: var_283 = readInt() (specialization rank)
   * 9. class_375: var_66 = readInt() (spec XP)
   * 10. class_375: var_897 = readInt() (flags)
   */
  static encodePlayerAttributes(stream, level, maxHealth, maxEnergy) {
    // 1. class_87: expLevel
    stream.writeInt(level);
    
    // 2. class_86: var_215 (health << 10)
    // Health is stored as value * 1024 (left shift 10)
    stream.writeInt(maxHealth << 10);
    
    // 3. class_87: if !isAlive() read boolean - we're alive so skip
    // isAlive() returns var_215 > 0, and we have health > 0
    
    // 4. class_87: var_491 (energy << 10)
    stream.writeInt(maxEnergy << 10);
    
    // 5. class_375: var_95 (total XP earned)
    stream.writeInt(0);
    
    // 6. class_375: var_86 (current XP)
    stream.writeInt(0);
    
    // 7. class_375: specialization ID (0 = none)
    stream.writeInt(0);
    
    // 8. class_375: var_283 (specialization rank)
    stream.writeInt(0);
    
    // 9. class_375: var_66 (spec XP)
    stream.writeInt(0);
    
    // 10. class_375: var_897 (flags)
    stream.writeInt(0);
  }

  /**
   * Encode SkillSystem (class_385)
   * 3 skill bars + active index + cooldowns
   */
  static encodeSkillSystem(stream) {
    // 3 skill bars (0=consumables, 1=auto-attack, 2=player skills)
    for (let i = 0; i < 3; i++) {
      this.encodeSkillBar(stream);
    }
    
    // Active skill bar index (-1 if none)
    stream.writeInt(-1);
    
    // Remaining global cooldown
    stream.writeInt(0);
    
    // Max global cooldown
    stream.writeInt(0);
    
    // Cooldowns array length
    stream.writeInt(0);
    // No cooldowns to encode
  }

  /**
   * Encode SkillBar (class_391)
   * Empty skill bar for new player
   */
  static encodeSkillBar(stream) {
    // Skills array length
    stream.writeInt(0);
    // If length > 0:
    //   for each skill: writeBoolean(skill != null); if not null: writeInt(skillData.globalID)
    //   for each skill: if not null: skill.encode()
    //   writeInt(activeSkillIndex)
    // Since length = 0, nothing more to write
  }

  /**
   * Encode BuffSystem (class_384)
   * Empty buffs for new player
   */
  static encodeBuffSystem(stream) {
    // Buffs array length
    stream.writeInt(0);
    // No buffs to encode
  }

  /**
   * Encode BitList (class_323)
   * Fixed-size int array, all zeros
   * 
   * @param {ByteStream} stream - The ByteStream to write to
   * @param {number} intCount - Number of ints to write (bitCount / 32)
   */
  static encodeBitList(stream, intCount) {
    // Just write each int directly (no length prefix)
    for (let i = 0; i < intCount; i++) {
      stream.writeInt(0);
    }
  }

  /**
   * Encode MissionSystem (class_50)
   * Empty missions for new player
   * 
   * @param {ByteStream} stream - The ByteStream to write to
   * @param {number} completedBitListIntCount - Size of completed missions bitlist
   */
  static encodeMissionSystem(stream, completedBitListIntCount) {
    // Active missions array length
    stream.writeInt(0);
    // No active missions to encode
    
    // Completed missions BitList (class_323)
    // Size = class_57.const_342 * class_128.method_786().method_2292()
    this.encodeBitList(stream, completedBitListIntCount);
    
    // Daily mission cooldowns array length
    stream.writeInt(0);
    // No cooldowns to encode
  }

  /**
   * Encode Specializations (class_383)
   * No specialization for new player
   */
  static encodeSpecializations(stream) {
    // writeBoolean(hasSpecialization)
    stream.writeBoolean(false);
    // If has: writeInt(specData.globalID); spec.encode()
    // Since false, nothing more
    
    // writeInt(reSpecCount)
    stream.writeInt(0);
  }

  /**
   * Encode KnownSkills (class_382)
   * Empty skills for new player
   */
  static encodeKnownSkills(stream) {
    // writeInt(knownSkills.length)
    stream.writeInt(0);
    // No skills to encode
  }

  /**
   * Encode Party (class_97)
   * Empty party for new player
   */
  static encodeParty(stream) {
    // writeInt(members.length)
    stream.writeInt(0);
    // No members to encode
  }

  /**
   * Encode Achievements (class_392)
   * 2 empty slots
   */
  static encodeAchievements(stream) {
    // Fixed size of 2 slots (const_67)
    // for i = 0 to 1: writeBoolean(slot != null); if slot: slot.encode()
    stream.writeBoolean(false); // Slot 0 empty
    stream.writeBoolean(false); // Slot 1 empty
  }

  /**
   * Encode a base avatar (class_75) - used for mercenary
   * Not typically needed for new players, but included for completeness
   * 
   * @param {ByteStream} stream - The ByteStream to write to
   * @param {Object} avatarData - Avatar data object
   */
  static encodeBaseAvatar(stream, avatarData) {
    // CharacterData globalID
    stream.writeInt(avatarData.characterDataId || 2097152);
    
    // SkillSystem
    this.encodeSkillSystem(stream);
    
    // BuffSystem
    this.encodeBuffSystem(stream);
    
    // Inventory bag (simple class_68, not class_400)
    this.encodeEmptyBag(stream);
    
    // Attributes (simple class_87, not class_375)
    this.encodeSimpleAttributes(stream, avatarData.level || 1, avatarData.maxHealth || 100, avatarData.maxEnergy || 100);
  }

  /**
   * Encode simple Attributes (class_87) - for non-player avatars
   */
  static encodeSimpleAttributes(stream, level, maxHealth, maxEnergy) {
    // class_87: expLevel
    stream.writeInt(level);
    
    // class_86: var_215 (health << 10)
    stream.writeInt(maxHealth << 10);
    
    // class_87: var_491 (energy << 10)
    stream.writeInt(maxEnergy << 10);
  }
}

module.exports = AvatarEncoder;
