const Command = require('../../Command')

/**
 * HeartbeatCommand (ID: 501)
 * Lightweight ping/heartbeat to keep connection alive
 * Original game client sends this periodically
 */
class HeartbeatCommand extends Command {
  constructor(client, data) {
    super(client, data)
    this.id = 501
    this.name = 'Heartbeat'
  }

  validate() {
    // Heartbeat is always valid
    return true
  }

  async execute() {
    // Just acknowledge the heartbeat
    return {
      success: true,
      timestamp: Date.now(),
      message: 'Heartbeat received'
    }
  }
}

module.exports = HeartbeatCommand
