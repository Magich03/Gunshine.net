# Client-Server Command Protocol - CORRECTED

## CRITICAL DISTINCTION

There are **TWO DIFFERENT command systems** in Gunshine:

### 1. CLIENT-TO-SERVER COMMANDS (CommandExecuteMessage 10403)
**Used by**: Client sends game actions to server  
**Message ID**: 10403  
**Your Custom Command IDs**: 1001 (Move), 1002 (Attack), 1003 (Cast Spell), 1004 (Inventory), 1005 (Craft), 1006 (Quest), 501 (Heartbeat)  
**Who responds**: Server executes, sends back 20403 (CommandResultMessage) or other responses  
**Flow**:
1. Client sends CommandExecuteMessage with command ID 1001-1006
2. Server's CommandExecuteMessage handler receives and processes
3. Server executes the command and updates game state
4. Server sends acknowledgment/result back to client

### 2. SERVER-TO-CLIENT COMMANDS (EndTurnMessage 20400)
**Used by**: Server sends game state updates  
**Message ID**: 20400  
**Command Type IDs**: 13, 16, 17, 18, 19, 20, 26, 48, 49, 501+ (defined in client's class_141.as)  
**Command factory**: `class_144.method_873()` reads type and deserializes  
**These are NOT your custom command IDs!**  
**Flow**:
1. Server creates EndTurnMessage with game state changes
2. Server adds commands like AddPlayerCommand (type 16)
3. Server sends EndTurnMessage to client
4. Client's CommandManager deserializes based on command TYPE
5. Client applies game state changes

---

## THE PROBLEM WITH CURRENT IMPLEMENTATION

**EndTurnMessage.js is sending custom command IDs (1001, 1002, etc.) in the command type field!**

```javascript
// WRONG - This is what you're doing:
encodeAddPlayerCommand(playerData) {
  this.writeBoolean(true)
  this.encodeAvatarData(playerData)
  this.writeInt(0)  // This is supposed to be the command TYPE, but you're treating it as a parameter!
}

encode() {
  this.writeInt(0)  // tick1
  this.writeInt(0)  // tick2
  this.writeInt(this.commands.length)  // command count
  
  for (const command of this.commands) {
    this.writeInt(command.type)  // <-- HERE: writes 16 for AddPlayerCommand - CORRECT
    
    if (command.type === 16) {
      this.encodeAddPlayerCommand(command.playerData)
    }
  }
}
```

Actually, looking at the code more carefully, **you ARE sending type 16 correctly** in the commands array. 

The issue is that you shouldn't be trying to send any commands in EndTurnMessage for game actions. EndTurnMessage is for:
- Spawning/removing players
- World state changes
- System events

NOT for responding to player commands!

---

## CORRECT COMMAND FLOW

### Step 1: Player sends a command (Client→Server)
```
Client sends: CommandExecuteMessage (10403)
{
  command_id: 1001,      // Move command
  parameters: {...}
}

Server receives in: Protocol/Messages/Client/CommandExecuteMessage.js
```

### Step 2: Server executes command (Server processes)
```
CommandExecuteMessage.js processes:
1. Validates command
2. Calls CommandRegistry.execute(commandId, player, params)
3. Command executes (MoveCommand, AttackCommand, etc.)
4. Updates player state
```

### Step 3: Server sends response (Server→Client)
```
Option A: Send CommandResultMessage (20403) with result
  - Use this for immediate feedback (success/failure)
  
Option B: Send EndTurnMessage (20400) with state updates
  - Use this for game state changes that affect other players
  - Example: MovementCommand moves player, server sends EndTurnMessage
    with updated player position so other clients see the movement
```

---

## CORRECT EndTurnMessage USAGE

EndTurnMessage should ONLY contain server-managed commands that affect game world state:

```javascript
// Correct EndTurnMessage usage

// When player moves (received via CommandExecuteMessage 1001):
const endTurnMsg = new EndTurnMessage(this.client)

// Send other players' updated positions, not a response to THIS player's command
// Example: if NPC moved, tell all clients
// endTurnMsg.addCommand(type: 18, /* NPC move data */)

// Send new objects spawned
// endTurnMsg.addCommand(type: 16, /* new player */)

await endTurnMsg.send()

// BUT: Never send a response to the player's OWN command here!
// The player already knows they sent the move command
```

---

## WHAT SHOULD HAPPEN INSTEAD

### For Player Commands (1001-1006):

**Client sends**: CommandExecuteMessage (10403) with command_id=1001-1006

**Server should NOT send**: EndTurnMessage with the same command

**Server SHOULD send**:
1. **CommandResultMessage (20403)** - Acknowledge the command succeeded/failed
2. **Then EndTurnMessage (20400)** - IF other players need to see the result
   - Example: Player A moves → tell all other clients about Player A's new position

### The Issue:
Your current CommandExecuteMessage handler probably does nothing, leaving client confused waiting for response.

---

## FIXING THE IMPLEMENTATION

### 1. CommandExecuteMessage Handler (already exists)
Should:
- Validate command
- Execute via CommandRegistry
- Send CommandResultMessage (20403) with result
- If needed, also send EndTurnMessage with updated state

### 2. CommandResultMessage (20403)
Send this after EVERY command to acknowledge it was received:
```javascript
const result = new CommandResultMessage(this.client)
result.commandId = 1001
result.success = true  
result.data = { /* result data */ }
await result.send()
```

### 3. EndTurnMessage (20400)
Send this ONLY for world state changes that affect other players:
```javascript
// Only if OTHER players need to see this
const endTurnMsg = new EndTurnMessage(this.client)
endTurnMsg.addCommand(type: 18, /* player movement data for broadcast */)
await endTurnMsg.send()
```

---

## CLIENT'S COMMAND PARSING

From `package_48/class_144.as` method_873():
- Command type 501 = MOVE → parsed by class_552
- Command type 502 = SET_TARGET → parsed by class_574
- Command type 503 = SKILL → parsed by class_476
- Command type 505+ = other game commands
- Command type 16 = ADD_PLAYER → parsed by class_188
- **Any type not in this list causes client error!**

Your custom IDs (1001-1006) are NOT in this list because they're for ClientServerMessage (10403), not EndTurnMessage (20400).

---

## SUMMARY

| Direction | Message ID | Command IDs | Purpose |
|-----------|------------|------------|---------|
| Client→Server | 10403 | 1001-1006, 501 | Player sends action |
| Server→Client | 20403 | Any | Acknowledge command result |
| Server→Client | 20400 | 16,17,18,... | Broadcast game state |

**Never mix them! EndTurnMessage command types must be 13, 16, 17, 18, 19, 20, 26, 48, 49, 501+ — the types the client's CommandManager knows how to deserialize.**
