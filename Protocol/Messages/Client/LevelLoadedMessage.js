const PiranhaMessage = require('../../PiranhaMessage')
const StartLogicMessage = require('../Server/StartLogicMessage')
const EndTurnMessage = require('../Server/EndTurnMessage')

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
 * 
 * The client waits for the player object to exist in getGameObjectManager()
 * before continuing past 79% (see class_174.as lines 464-471).
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
    // This is required for the client to find the player in getPlayerByAvatarId()
    // and continue loading past 79%
    const playerData = this.client.playerData || {
      characterDataId: 2097199,  // MalePlayerConstructionWorker
      idHigh: 0,
      idLow: 1,
      name: "Player"
    }
    
    console.log('[LevelLoadedMessage] Sending EndTurnMessage (20400) with AddPlayerCommand')
    const endTurnMsg = new EndTurnMessage(this.client, playerData)
    endTurnMsg.addPlayerCommand(playerData)
    await endTurnMsg.send()
    
    console.log('[LevelLoadedMessage] Player spawned in game world!')
  }
}

module.exports = LevelLoadedMessage
