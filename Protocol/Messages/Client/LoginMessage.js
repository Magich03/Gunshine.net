const PiranhaMessage = require('../../PiranhaMessage')
const LoginOkMessage = require('../Server/LoginOkMessage')
const LoginFailedMessage = require('../Server/LoginFailedMessage')
const { getInstance: getResourceRegeneration } = require('../../ResourceRegenerationSystem')
const { getInstance: getBuffDebuffSystem } = require('../../BuffDebuffSystem')
const { getInstance: getPlayerStorage } = require('../../../DataBase/PlayerStorage')

class LoginMessage extends PiranhaMessage {
  constructor (bytes, client) {
    super(bytes)
    this.client = client
    this.id = 10101
    this.version = 1
  }

  async decode () {
    this.data = {}

    this.data.Email = this.readString()
    this.data.PasswordHash = this.readString()

    console.log(this.data)
  }

  async process () {
    this.client.userObject = Object.assign({}, {
      Email: this.data.Email,
      PasswordHash: this.data.PasswordHash
    })
    
    // Get player from in-memory storage
    const playerStorage = getPlayerStorage()
    // For now, create a player ID from email hash
    const emailHash = this.data.Email.charCodeAt(0) || 1
    const player = playerStorage.getPlayer(emailHash, this.data.Email.length)
    
    this.client.player = player
    
    // Start resource regeneration for this player
    const regenerationSystem = getResourceRegeneration()
    regenerationSystem.startRegeneration(this.client)
    
    // Start buff/debuff system for this player
    const buffSystem = getBuffDebuffSystem()
    buffSystem.startBuffTicker(this.client)
    
    await new LoginOkMessage(this.client).send()
  }
}

module.exports = LoginMessage