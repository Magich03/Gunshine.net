const Command = require('../../Command')

/**
 * InventoryCommand (ID: 1004)
 * Manage player inventory
 */
class InventoryCommand extends Command {
  constructor(client, data) {
    super(client, data)
    this.id = 1004
    this.name = 'Inventory'
  }

  validate() {
    if (!super.validate()) return false
    
    const action = this.data.action
    if (!['get', 'use', 'drop'].includes(action)) return false
    
    if (action === 'use' || action === 'drop') {
      if (typeof this.data.itemId !== 'string') return false
    }
    
    return true
  }

  async execute() {
    // Initialize inventory if needed
    if (!this.client.player.inventory) {
      this.client.player.inventory = []
    }

    let result = { success: true }

    if (this.data.action === 'get') {
      // Return inventory list
      result.items = this.client.player.inventory.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        rarity: item.rarity
      }))
      result.inventoryCount = this.client.player.inventory.length
    } else if (this.data.action === 'use') {
      // Use an item
      const item = this.client.player.inventory.find(i => i.id === this.data.itemId)
      if (!item) {
        return { success: false, error: 'Item not found' }
      }

      // Handle item effects
      if (item.type === 'potion') {
        this.addResource('health', item.value)
        this.clampResource('health')
        result.message = `Used ${item.name}, restored ${item.value} health`
      }

      // Remove item from inventory
      item.quantity--
      if (item.quantity <= 0) {
        this.client.player.inventory = this.client.player.inventory.filter(i => i.id !== item.id)
      }

      this.recordCommand()
    } else if (this.data.action === 'drop') {
      // Drop an item
      const itemIndex = this.client.player.inventory.findIndex(i => i.id === this.data.itemId)
      if (itemIndex === -1) {
        return { success: false, error: 'Item not found' }
      }

      const item = this.client.player.inventory[itemIndex]
      result.droppedItem = {
        name: item.name,
        quantity: item.quantity,
        position: this.client.player.position
      }

      this.client.player.inventory.splice(itemIndex, 1)
      this.recordCommand()
    }

    return result
  }
}

module.exports = InventoryCommand
