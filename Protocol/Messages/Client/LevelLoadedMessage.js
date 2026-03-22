const PiranhaMessage = require('../../PiranhaMessage')
const StartLogicMessage = require('../Server/StartLogicMessage')
const EndTurnMessage = require('../Server/EndTurnMessage')
const AddPlayerCommand = require('../../Commands/Server/AddPlayerCommand')
const { getInstance: getPlayerStorage } = require('../../../DataBase/PlayerStorage')

/**
 * LevelLoadedMessage (10405)
 * 
 * Sent by client when the level has finished loading (at ~79% progress).
 * This is an empty message with no payload.
 * 
 * Client class: package_57.class_183
 * 
 * Server must respond with:
 * 1. StartLogicMessage (20405) - starts the game logic timer
 * 2. EndTurnMessage (20400) with AddPlayerCommand - spawns the player in world
 */
class LevelLoadedMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes)
    this.client = client
    this.id = 10405
    this.version = 0
  }

  async decode() {
    // Empty message - no payload to decode
  }

  async process() {
    console.log('[LevelLoadedMessage] Level loaded, starting game logic...')
    
    // 1. Send StartLogicMessage to start the game logic timer
    console.log('[LevelLoadedMessage] Sending StartLogicMessage (20405)')
    await new StartLogicMessage(this.client).send()
    
    // 2. Send EndTurnMessage with AddPlayerCommand to spawn the player
    // Get real player data from storage
    const player = this.client.player
    
    if (!player) {
      console.error('[LevelLoadedMessage] ERROR: No player data available!')
      return
    }

    // Prepare player data with real values
    const playerData = {
      characterDataId: player.characterDataId || 2097199,
      idHigh: player.highId || 0,
      idLow: player.lowId || 1,  // IMPORTANT: Must NOT be 0
      name: player.name || "Player",
      level: player.level || 1,
      resources: player.resources || {
        health: 100,
        energy: 100,
        money: 100
      }
    }
    
    console.log('[LevelLoadedMessage] Spawning player:', playerData.name, `(ID: ${playerData.idHigh}:${playerData.idLow})`)
    
    // Create EndTurnMessage with AddPlayerCommand
    const endTurnMsg = new EndTurnMessage(this.client)
    const addPlayerCmd = new AddPlayerCommand(playerData)
    addPlayerCmd.executeTick = 0
    endTurnMsg.addCommand(addPlayerCmd)
    
    console.log('[LevelLoadedMessage] Sending EndTurnMessage (20400) with AddPlayerCommand (type 16)')
    await endTurnMsg.send()
    
    console.log('[LevelLoadedMessage] Player spawned in game world!')
  }
}

module.exports = LevelLoadedMessage
