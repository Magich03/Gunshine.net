# Game Command System - Client Integration Guide

This guide explains how to integrate the game command system into your game client. The client sends message ID **10403** (CommandExecuteMessage) to execute commands on the server.

## Message Format

### Command Message (ID: 10403)
The client sends:
```
[Message ID: 2 bytes] (10403 in big-endian)
[Length: 3 bytes] (payload length in big-endian)
[Payload (encrypted)]
  ├─ commandId: int (4 bytes)
  └─ parameters: string (JSON)
```

### Response Message (ID: 20403)
The server responds with:
```
[Message ID: 2 bytes] (20403 in big-endian)
[Length: 3 bytes] (payload length in big-endian)
[Payload (encrypted)]
  ├─ success: byte (1 = success, 0 = failure)
  └─ result: string (JSON response)
```

## Available Commands

### 1. Move Command (ID: 1001)
Move the player to a new position.

**Parameters:**
```json
{
  "x": 100,
  "y": 150
}
```

**Response:**
```json
{
  "success": true,
  "oldPosition": {"x": 50, "y": 75},
  "newPosition": {"x": 100, "y": 150},
  "energyRemaining": 99
}
```

**Notes:**
- Costs 1 energy
- Maximum movement distance: 50 units
- Cooldown: 0.5 seconds between moves
- Valid coordinates: 0-1000 for both X and Y

---

### 2. Attack Command (ID: 1002)
Attack a target entity.

**Parameters:**
```json
{
  "targetId": 12345
}
```

**Response:**
```json
{
  "success": true,
  "targetId": 12345,
  "damage": 15,
  "isCritical": false,
  "staminaRemaining": 95
}
```

**Notes:**
- Costs 5 stamina
- Damage range: 5-15 base + (strength × 0.1)
- 20% chance for critical hit (1.5× damage)
- Base damage modified by player strength stat

---

### 3. Cast Spell Command (ID: 1003)
Cast a spell with various effects.

**Available Spells:**

#### Fireball
```json
{
  "spellName": "fireball"
}
```
Response:
```json
{
  "success": true,
  "spell": "fireball",
  "manaCost": 20,
  "manaRemaining": 80,
  "result": {
    "type": "damage",
    "value": 25,
    "areaRadius": 5
  }
}
```

#### Heal
```json
{
  "spellName": "heal"
}
```
Response:
```json
{
  "success": true,
  "spell": "heal",
  "manaCost": 15,
  "manaRemaining": 85,
  "result": {
    "type": "heal",
    "value": 18,
    "healthRemaining": 92
  }
}
```

#### Shield
```json
{
  "spellName": "shield"
}
```
Response:
```json
{
  "success": true,
  "spell": "shield",
  "manaCost": 10,
  "manaRemaining": 90,
  "result": {
    "type": "shield",
    "value": 15,
    "duration": 30
  }
}
```

#### Teleport
```json
{
  "spellName": "teleport"
}
```
Response:
```json
{
  "success": true,
  "spell": "teleport",
  "manaCost": 25,
  "manaRemaining": 75,
  "result": {
    "type": "teleport",
    "from": {"x": 100, "y": 150},
    "to": {"x": 456, "y": 789}
  }
}
```

**Notes:**
- Fireball: 20 mana, damage 15-35
- Heal: 15 mana, heal 10-25 HP
- Shield: 10 mana, shield value 10-20, lasts 30 seconds
- Teleport: 25 mana, random destination

---

### 4. Inventory Command (ID: 1004)
Manage player inventory.

**Get Inventory:**
```json
{
  "action": "get"
}
```
Response:
```json
{
  "success": true,
  "items": [
    {"id": "item_1", "name": "Health Potion", "quantity": 5, "rarity": "common"},
    {"id": "item_2", "name": "Iron Sword", "quantity": 1, "rarity": "uncommon"}
  ],
  "inventoryCount": 2
}
```

**Use Item:**
```json
{
  "action": "use",
  "itemId": "item_1"
}
```
Response:
```json
{
  "success": true,
  "message": "Used Health Potion, restored 25 health"
}
```

**Drop Item:**
```json
{
  "action": "drop",
  "itemId": "item_2"
}
```
Response:
```json
{
  "success": true,
  "droppedItem": {
    "name": "Iron Sword",
    "quantity": 1,
    "position": {"x": 100, "y": 150}
  }
}
```

---

### 5. Craft Command (ID: 1005)
Craft items from materials.

**Available Recipes:**
- `iron_sword`: Requires 5 iron_ore + 2 wood → 1 Iron Sword (10 mana)
- `health_potion`: Requires 3 herb + 1 water → 5 Health Potions (5 mana)
- `mana_potion`: Requires 2 crystal + 1 water → 3 Mana Potions (15 mana)
- `shield_charm`: Requires 3 silver + 5 crystal → 1 Shield Charm (50 mana)

**Request:**
```json
{
  "recipeId": "health_potion"
}
```

**Response:**
```json
{
  "success": true,
  "recipeName": "health_potion",
  "craftedItem": {
    "name": "Health Potion",
    "quantity": 5,
    "rarity": "common",
    "type": "potion",
    "value": 25
  },
  "craftTime": 2,
  "manaUsed": 5,
  "manaRemaining": 95
}
```

---

### 6. Quest Command (ID: 1006)
Manage quests.

**List Available Quests:**
```json
{
  "action": "list"
}
```
Response:
```json
{
  "success": true,
  "availableQuests": [
    {
      "id": "slay_goblins",
      "name": "Slay 10 Goblins",
      "description": "Defeat 10 goblins in the forest",
      "level": 1,
      "isCompleted": false,
      "isActive": false
    },
    {
      "id": "collect_herbs",
      "name": "Collect Herbs",
      "description": "Gather 5 healing herbs",
      "level": 1,
      "isCompleted": false,
      "isActive": false
    }
  ]
}
```

**Accept Quest:**
```json
{
  "action": "accept",
  "questId": "slay_goblins"
}
```
Response:
```json
{
  "success": true,
  "message": "Accepted quest: Slay 10 Goblins",
  "quest": {
    "id": "slay_goblins",
    "name": "Slay 10 Goblins",
    "progress": 0,
    "target": 10,
    "acceptedAt": 1711064400000,
    "targetType": "kill"
  }
}
```

**Check Progress:**
```json
{
  "action": "progress",
  "questId": "slay_goblins",
  "increment": 3
}
```
Response:
```json
{
  "success": true,
  "questId": "slay_goblins",
  "progress": 3,
  "target": 10,
  "isComplete": false
}
```

**Complete Quest:**
```json
{
  "action": "complete",
  "questId": "slay_goblins"
}
```
Response:
```json
{
  "success": true,
  "completedQuest": "slay_goblins",
  "reward": {
    "xp": 500,
    "gold": 250,
    "items": ["goblin_ear"]
  },
  "message": "Quest completed: Slay 10 Goblins"
}
```

---

## Example: ActionScript Client Code

```actionscript
package game.commands {
  import flash.utils.ByteArray;
  import game.net.NetworkConnection;
  import game.crypto.Crypto;

  public class CommandManager {
    private var connection:NetworkConnection;
    private var crypto:Crypto;

    public function CommandManager(conn:NetworkConnection, cryptoObj:Crypto) {
      connection = conn;
      crypto = cryptoObj;
    }

    /**
     * Send a command to the server
     */
    public function executeCommand(commandId:int, parameters:Object, callback:Function):void {
      var payload:ByteArray = new ByteArray();
      
      // Write command ID
      payload.writeInt(commandId);
      
      // Write parameters as JSON
      var paramsJson:String = JSON.stringify(parameters);
      payload.writeUTF(paramsJson);
      
      // Encrypt payload
      crypto.encryptAsync(payload, function(encrypted:ByteArray):void {
        sendPacket(0x28AF, encrypted); // 0x28AF = 10403 in hex
        
        // Listen for response
        connection.once(0x4F9F, function(responsePayload:ByteArray):void { // 0x4F9F = 20403
          handleCommandResponse(responsePayload, callback);
        });
      });
    }

    /**
     * Handle command response from server
     */
    private function handleCommandResponse(payload:ByteArray, callback:Function):void {
      // Read success flag
      var success:int = payload.readByte();
      
      // Read result JSON
      var resultJson:String = payload.readUTF();
      var result:Object = JSON.parse(resultJson);
      
      callback(success === 1, result);
    }

    /**
     * Send packet with message ID
     */
    private function sendPacket(messageId:int, payload:ByteArray):void {
      var packet:ByteArray = new ByteArray();
      
      // Message ID (big-endian)
      packet.writeShort(messageId);
      
      // Length (3 bytes, big-endian)
      packet.writeByte((payload.length >> 16) & 0xFF);
      packet.writeByte((payload.length >> 8) & 0xFF);
      packet.writeByte(payload.length & 0xFF);
      
      // Payload
      packet.writeBytes(payload);
      
      connection.send(packet);
    }

    /**
     * Convenience methods for common commands
     */
    public function movePlayer(x:int, y:int, callback:Function):void {
      executeCommand(1001, {x: x, y: y}, callback);
    }

    public function attack(targetId:int, callback:Function):void {
      executeCommand(1002, {targetId: targetId}, callback);
    }

    public function castSpell(spellName:String, callback:Function):void {
      executeCommand(1003, {spellName: spellName}, callback);
    }

    public function getInventory(callback:Function):void {
      executeCommand(1004, {action: "get"}, callback);
    }

    public function useItem(itemId:String, callback:Function):void {
      executeCommand(1004, {action: "use", itemId: itemId}, callback);
    }

    public function craftItem(recipeId:String, callback:Function):void {
      executeCommand(1005, {recipeId: recipeId}, callback);
    }

    public function acceptQuest(questId:String, callback:Function):void {
      executeCommand(1006, {action: "accept", questId: questId}, callback);
    }
  }
}
```

---

## Resource System

### Starting Resources
All players start with:
- Health: 100/100
- Mana: 100/100
- Energy: 100/100
- Stamina: 100/100

### Resource Regeneration
Resources regenerate automatically based on stats:
- **Health**: 2 base + (vitality × 0.1) per 5 seconds
- **Mana**: 3 base + (intelligence × 0.15) per 5 seconds
- **Energy**: 4 base + (dexterity × 0.12) per 5 seconds
- **Stamina**: 5 base + (strength × 0.1) per 5 seconds

Higher stats = faster regeneration!

---

## Error Handling

Common error responses:

```json
{
  "success": false,
  "error": "Command validation failed"
}
```

```json
{
  "success": false,
  "error": "Unknown command: 9999"
}
```

```json
{
  "success": false,
  "error": "Not enough energy"
}
```

Always check the `success` flag before using the result data.

---

## Best Practices

1. **Always validate responses** - Check `success` flag before using result
2. **Handle cooldowns** - MoveCommand has a 0.5 second cooldown
3. **Monitor resources** - Check resource availability before sending commands
4. **Use callbacks** - Commands are asynchronous, use callbacks for response handling
5. **Error recovery** - Implement retry logic for failed commands
6. **Rate limiting** - Don't spam commands; use appropriate delays

---

## Integration Checklist

- [ ] Implement CommandManager class in your client
- [ ] Wire up network connection and crypto
- [ ] Create UI for movement input
- [ ] Create UI for combat actions
- [ ] Create UI for inventory management
- [ ] Create UI for quest tracking
- [ ] Test each command with server
- [ ] Implement error handling
- [ ] Add resource display (health, mana, energy, stamina)
- [ ] Add buff/debuff visual indicators

---

For questions or issues, refer to the main README.md or examine the server-side command implementations in `Protocol/Messages/Commands/`.
