const Command = require('../../Command')

/**
 * CraftCommand (ID: 1005)
 * Craft items from materials
 */
class CraftCommand extends Command {
  constructor(client, data) {
    super(client, data)
    this.id = 1005
    this.name = 'Craft'
    
    // Define craftable recipes
    this.recipes = {
      iron_sword: {
        materials: { iron_ore: 5, wood: 2 },
        result: { name: 'Iron Sword', quantity: 1, rarity: 'uncommon' },
        manaCost: 10,
        craftTime: 5 // seconds
      },
      health_potion: {
        materials: { herb: 3, water: 1 },
        result: { name: 'Health Potion', quantity: 5, rarity: 'common', type: 'potion', value: 25 },
        manaCost: 5,
        craftTime: 2
      },
      mana_potion: {
        materials: { crystal: 2, water: 1 },
        result: { name: 'Mana Potion', quantity: 3, rarity: 'uncommon', type: 'potion', value: 30 },
        manaCost: 15,
        craftTime: 3
      },
      shield_charm: {
        materials: { silver: 3, crystal: 5 },
        result: { name: 'Shield Charm', quantity: 1, rarity: 'rare' },
        manaCost: 50,
        craftTime: 10
      }
    }
  }

  validate() {
    if (!super.validate()) return false
    
    const recipeId = this.data.recipeId
    if (!this.recipes[recipeId]) return false
    
    // Check if player has required materials
    const recipe = this.recipes[recipeId]
    for (const [material, needed] of Object.entries(recipe.materials)) {
      const have = this.getInventoryItemCount(material)
      if (have < needed) return false
    }

    // Check mana cost
    if (!this.hasResource('mana', recipe.manaCost)) return false

    return true
  }

  getInventoryItemCount(itemId) {
    if (!this.client.player.inventory) return 0
    const item = this.client.player.inventory.find(i => i.id === itemId)
    return item ? item.quantity : 0
  }

  removeInventoryItem(itemId, quantity) {
    if (!this.client.player.inventory) return
    
    const item = this.client.player.inventory.find(i => i.id === itemId)
    if (!item) return

    item.quantity -= quantity
    if (item.quantity <= 0) {
      this.client.player.inventory = this.client.player.inventory.filter(i => i.id !== itemId)
    }
  }

  addInventoryItem(item) {
    if (!this.client.player.inventory) {
      this.client.player.inventory = []
    }

    const existingItem = this.client.player.inventory.find(i => i.name === item.name && i.rarity === item.rarity)
    if (existingItem) {
      existingItem.quantity += item.quantity
    } else {
      this.client.player.inventory.push({
        id: `${item.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        name: item.name,
        quantity: item.quantity,
        rarity: item.rarity,
        type: item.type,
        value: item.value
      })
    }
  }

  async execute() {
    const recipe = this.recipes[this.data.recipeId]
    
    // Consume materials
    for (const [material, needed] of Object.entries(recipe.materials)) {
      this.removeInventoryItem(material, needed)
    }

    // Consume mana
    this.consumeResource('mana', recipe.manaCost)
    this.recordCommand()

    // Add crafted item to inventory
    this.addInventoryItem(recipe.result)

    return {
      success: true,
      recipeName: this.data.recipeId,
      craftedItem: recipe.result,
      craftTime: recipe.craftTime,
      manaUsed: recipe.manaCost,
      manaRemaining: this.client.player.resources.mana
    }
  }
}

module.exports = CraftCommand
