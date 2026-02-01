const PiranhaMessage = require('../../PiranhaMessage')
const CreatePlayerOkMessage = require('../Server/CreatePlayerOkMessage')
const CreatePlayerFailedMessage = require('../Server/CreatePlayerFailedMessage')

/**
 * CreatePlayerMessage (10200)
 * 
 * Sent by client when creating a new character.
 * Structure (from client class_489):
 * - name: String
 * - characterData: int (globalID of character class/type)
 * - propsCount: int (length of props array)
 * - props: Vector.<int> (appearance properties)
 */
class CreatePlayerMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes)
    this.client = client
    this.id = 10200
    this.version = 1
  }

  async decode() {
    this.data = {}

    // Read player name (string)
    this.data.name = this.readString()
    
    // Read character data globalID (int, not string!)
    this.data.characterDataId = this.readInt()
    
    // Read props count
    this.data.propsCount = this.readInt()
    
    // Read props array (Vector.<int>)
    this.data.props = []
    for (let i = 0; i < this.data.propsCount; i++) {
      this.data.props.push(this.readInt())
    }

    console.log('[CreatePlayerMessage] Received:', this.data)
  }

  async process() {
    // Create player data for the avatar encoder
    const playerData = {
      // Player identity
      idHigh: 0,
      idLow: this.client.accountId || 1, // Use account ID or generate unique ID
      name: this.data.name,
      
      // Character class/type from client selection
      characterDataId: this.data.characterDataId,
      
      // Starting stats (level 1 new player)
      level: 1,
      maxHealth: 100,
      maxEnergy: 100,
      
      // BitList sizes - these depend on game data tables
      // Using reasonable defaults that should work
      missionBitListSize: 8,        // 256 bits for completed missions
      visitedLevelsBitListSize: 8,  // 256 bits for visited levels  
      secondBitListSize: 8,         // 256 bits for second bitlist
      
      // Starting location
      homeLevelId: 0,
      
      // Store props for later use (character appearance)
      props: this.data.props
    }

    // Store player data on client for later use
    this.client.player = playerData

    console.log('[CreatePlayerMessage] Creating player:', playerData.name, 'CharacterData:', playerData.characterDataId)

    // Send success response with full avatar
    await new CreatePlayerOkMessage(this.client, playerData).send()
  }
}

module.exports = CreatePlayerMessage
