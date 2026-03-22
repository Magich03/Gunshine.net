const Command = require('../../Command')

/**
 * QuestCommand (ID: 1006)
 * Manage quests (accept, complete, check progress)
 */
class QuestCommand extends Command {
  constructor(client, data) {
    super(client, data)
    this.id = 1006
    this.name = 'Quest'
    
    // Define available quests
    this.questDatabase = {
      slay_goblins: {
        name: 'Slay 10 Goblins',
        description: 'Defeat 10 goblins in the forest',
        targetType: 'kill',
        targetId: 'goblin',
        targetCount: 10,
        reward: { xp: 500, gold: 250, items: ['goblin_ear'] },
        level: 1
      },
      collect_herbs: {
        name: 'Collect Herbs',
        description: 'Gather 5 healing herbs',
        targetType: 'gather',
        targetId: 'herb',
        targetCount: 5,
        reward: { xp: 300, gold: 150 },
        level: 1
      },
      defend_village: {
        name: 'Defend the Village',
        description: 'Survive a 5-minute monster attack',
        targetType: 'defend',
        targetDuration: 300, // 5 minutes
        reward: { xp: 1000, gold: 500 },
        level: 5
      },
      boss_defeat: {
        name: 'Defeat the Forest Boss',
        description: 'Defeat the dangerous boss in the deep forest',
        targetType: 'kill',
        targetId: 'forest_boss',
        reward: { xp: 2000, gold: 1000, items: ['boss_loot'] },
        level: 10
      }
    }
  }

  validate() {
    if (!super.validate()) return false
    
    const action = this.data.action
    if (!['list', 'accept', 'progress', 'complete'].includes(action)) return false
    
    if (action !== 'list') {
      if (typeof this.data.questId !== 'string') return false
    }
    
    return true
  }

  async execute() {
    // Initialize quests if needed
    if (!this.client.player.quests) {
      this.client.player.quests = []
    }
    if (!this.client.player.completedQuests) {
      this.client.player.completedQuests = []
    }

    let result = { success: true }

    if (this.data.action === 'list') {
      // List available quests
      result.availableQuests = Object.entries(this.questDatabase).map(([id, quest]) => ({
        id,
        name: quest.name,
        description: quest.description,
        level: quest.level,
        isCompleted: this.client.player.completedQuests.includes(id),
        isActive: this.client.player.quests.some(q => q.id === id)
      }))
    } else if (this.data.action === 'accept') {
      // Accept a quest
      const questId = this.data.questId
      const questDef = this.questDatabase[questId]

      if (!questDef) {
        return { success: false, error: 'Quest not found' }
      }

      if (this.client.player.completedQuests.includes(questId)) {
        return { success: false, error: 'Quest already completed' }
      }

      if (this.client.player.quests.some(q => q.id === questId)) {
        return { success: false, error: 'Quest already active' }
      }

      const activeQuest = {
        id: questId,
        name: questDef.name,
        progress: 0,
        target: questDef.targetCount || questDef.targetDuration,
        acceptedAt: Date.now(),
        targetType: questDef.targetType
      }

      this.client.player.quests.push(activeQuest)
      this.recordCommand()

      result.message = `Accepted quest: ${questDef.name}`
      result.quest = activeQuest
    } else if (this.data.action === 'progress') {
      // Update quest progress
      const quest = this.client.player.quests.find(q => q.id === this.data.questId)

      if (!quest) {
        return { success: false, error: 'Quest not active' }
      }

      // Update progress (in real system, this would be called by combat/gathering systems)
      const increment = this.data.increment || 1
      quest.progress = Math.min(quest.progress + increment, quest.target)

      result.questId = quest.id
      result.progress = quest.progress
      result.target = quest.target
      result.isComplete = quest.progress >= quest.target
    } else if (this.data.action === 'complete') {
      // Complete a quest
      const quest = this.client.player.quests.find(q => q.id === this.data.questId)

      if (!quest) {
        return { success: false, error: 'Quest not active' }
      }

      if (quest.progress < quest.target) {
        return { success: false, error: 'Quest not yet complete' }
      }

      const questDef = this.questDatabase[quest.id]
      const reward = questDef.reward

      // Apply rewards
      this.addResource('health', reward.xp * 0.1) // Arbitrary XP to health conversion for demo
      if (reward.gold) {
        if (!this.client.player.gold) this.client.player.gold = 0
        this.client.player.gold += reward.gold
      }

      // Remove from active quests
      this.client.player.quests = this.client.player.quests.filter(q => q.id !== quest.id)
      this.client.player.completedQuests.push(quest.id)

      this.recordCommand()

      result.completedQuest = quest.id
      result.reward = reward
      result.message = `Quest completed: ${questDef.name}`
    }

    return result
  }
}

module.exports = QuestCommand
