# EndTurnMessage Implementation Guide

## Overview
`EndTurnMessage` (Message ID: 20400) is the primary way the server sends game state updates to the client, including:
- Player spawning (AddPlayerCommand)
- Game object updates
- Any other server-side events that need client synchronization

## Command Types
The EndTurnMessage can contain multiple commands. Command types use **single/double digit IDs**:

| Command Type | ID | Purpose | 
|---|---|---|
| AddPlayerCommand | 16 | Spawn player in game world |
| RemoveObjectCommand | 17 | Remove entity from world |
| MoveObjectCommand | 18 | Move entity in world |
| ChatCommand | 19 | Send chat message |
| DamageCommand | 20 | Apply damage to entity |

## Structure
```
[Message Header]
- Message ID: 20400 (UInt16 big-endian)
- Length: payload length (3 bytes big-endian)
- [Encrypted Payload]
  - Tick1: int (current game tick)
  - Tick2: int (sub-tick)
  - CommandCount: int (number of commands)
  - [For each command]
    - CommandType: int (16, 17, 18, etc.)
    - Command-specific data
    - ExecuteTick: int (when command should execute)
```

## Real Player Spawning

### Current Implementation
```javascript
// In LevelLoadedMessage.js - when client finishes loading level
const playerData = {
  characterDataId: 2097199,  // Character type
  idHigh: 0,                 // Player ID high
  idLow: 1,                  // Player ID low
  name: "PlayerName"         // Display name
}

const endTurnMsg = new EndTurnMessage(this.client, playerData)
endTurnMsg.addPlayerCommand(playerData)
await endTurnMsg.send()
```

### Proper Real Implementation

To spawn a real player from PlayerStorage:

```javascript
// Get player from storage
const playerStorage = getPlayerStorage()
const player = playerStorage.getPlayer(this.client.player.highId, this.client.player.lowId)

// Prepare player data with real values
const playerData = {
  characterDataId: player.characterDataId || 2097199,
  idHigh: player.highId || 0,
  idLow: player.lowId || 1,
  name: player.name || "Player",
  position: player.position || { x: 0, y: 0 },
  resources: player.resources || {},
  stats: player.stats || {}
}

// Create and send EndTurnMessage with AddPlayerCommand
const endTurnMsg = new EndTurnMessage(this.client, playerData)
endTurnMsg.addPlayerCommand(playerData)
await endTurnMsg.send()
```

### AddPlayerCommand Encoding
The AddPlayerCommand (type 16) encodes the full player avatar data:

```
AddPlayerCommand(type 16):
├─ hasAvatar: boolean (true = avatar data follows)
├─ Avatar Data (class_76):
│  ├─ CharacterDataId: int
│  ├─ SkillSystem: (3 skillbars × int count + active bar + cooldowns)
│  ├─ BuffSystem: int (buff count)
│  ├─ Inventory: (materials, money, diamonds, ingredients, equipment, main bag)
│  ├─ Attributes: (level, health, energy, XP, specialization)
│  ├─ Player ID: 2 ints (high, low)
│  ├─ Player Name: string
│  ├─ Facebook ID: string (null)
│  ├─ Tutorial BitList: 2 ints
│  ├─ Flags: int
│  ├─ Daily Reward: boolean + int
│  ├─ MissionSystem: (active missions + completed BitList)
│  ├─ Visited Levels: BitList (7 ints)
│  ├─ Achievements: BitList (2 ints)
│  ├─ Specializations: boolean + int
│  ├─ KnownSkills: int (count)
│  ├─ Party: int (count)
│  ├─ Mail Attachments: boolean
│  ├─ Mercenary Avatar: boolean
│  ├─ Crafting Bot ID: int
│  ├─ Achievements Slots: 2 booleans
│  ├─ Travel Type: 3 ints
│  ├─ Home Level ID: int
│  └─ Timestamps: 2 ints
└─ ExecuteTick: int (from base Command)
```

## Sending Multiple Commands

```javascript
const endTurnMsg = new EndTurnMessage(this.client)

// Add multiple commands
endTurnMsg.addPlayerCommand(playerData)
// Future: Add other command types like move, damage, etc.

await endTurnMsg.send()
```

## Client-Side Handling

When the client receives EndTurnMessage:
1. Reads tick values for synchronization
2. Loops through each command by type
3. For AddPlayerCommand (type 16):
   - Reads avatar data
   - Creates player object in game world
   - Adds to gameObjectManager
   - Continues level loading

## Debugging Tips

**If client disconnects after EndTurnMessage:**
- Check that avatar data encoding matches expected format
- Verify all required fields are present
- Ensure ByteStream offset is correct after encoding
- Check encryption is working (compare with working messages like LoginOkMessage)

**If player doesn't appear in game:**
- Verify player ID is correctly set (idLow must NOT be 0)
- Check character data ID is valid (2097199-2097204 for player characters)
- Ensure position data is included if tracking player position
- Verify resources and stats are initialized

**If command type is wrong:**
- Command types should be small integers (16, 17, 18, etc.)
- NOT your custom command IDs (1001, 1002, etc.)
- Custom command IDs are for CommandExecuteMessage (10403), not EndTurnMessage

## File References
- `Protocol/Messages/Server/EndTurnMessage.js` - Main implementation
- `Protocol/Messages/Client/LevelLoadedMessage.js` - Usage example
- `DataBase/PlayerStorage.js` - Player data source
- `Protocol/Messages/Server/StartLogicMessage.js` - Send before EndTurnMessage

