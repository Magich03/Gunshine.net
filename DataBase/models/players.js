const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../../config.json')

// Creating extended player schema with game state
const playersSchema = new Schema({
    highID: {
        type: Number,
        required: true
    },
    lowID: {
        type: Number,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: 'You'
    },
    email: {
        type: String,
        default: ''
    },
    passwordHash: {
        type: String,
        default: ''
    },
    
    // Game State
    position: {
        x: {
            type: Number,
            default: 0
        },
        y: {
            type: Number,
            default: 0
        }
    },
    
    // Resources
    resources: {
        health: {
            type: Number,
            default: 100
        },
        maxHealth: {
            type: Number,
            default: 100
        },
        mana: {
            type: Number,
            default: 100
        },
        maxMana: {
            type: Number,
            default: 100
        },
        energy: {
            type: Number,
            default: 100
        },
        maxEnergy: {
            type: Number,
            default: 100
        },
        stamina: {
            type: Number,
            default: 100
        },
        maxStamina: {
            type: Number,
            default: 100
        }
    },
    
    // Stats
    stats: {
        level: {
            type: Number,
            default: 1
        },
        experience: {
            type: Number,
            default: 0
        },
        strength: {
            type: Number,
            default: 10
        },
        intelligence: {
            type: Number,
            default: 10
        },
        dexterity: {
            type: Number,
            default: 10
        },
        vitality: {
            type: Number,
            default: 10
        }
    },
    
    // Buffs/Debuffs
    buffs: [{
        name: String,
        value: Number,
        expiresAt: Date
    }],
    
    // Active Commands
    commandHistory: [{
        commandId: Number,
        commandName: String,
        executedAt: { type: Date, default: Date.now },
        success: Boolean,
        result: Schema.Types.Mixed
    }],
    
    // Last activity
    lastCommand: {
        type: Date,
        default: null
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Index for faster queries
playersSchema.index({ highID: 1, lowID: 1 });
playersSchema.index({ email: 1 });
playersSchema.index({ lastUpdate: -1 });

mongoose.model('players', playersSchema);
