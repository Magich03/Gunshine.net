console.clear()

const figlet = require('figlet')
const net = require('net')
const MessageFactory = require('./Protocol/MessageFactory')
const { getInstance: getCommandRegistry } = require('./Protocol/CommandRegistry')
const { getInstance: getPlayerStorage } = require('./DataBase/PlayerStorage')
const { getInstance: getResourceRegeneration } = require('./Protocol/ResourceRegenerationSystem')
const { getInstance: getBuffDebuffSystem } = require('./Protocol/BuffDebuffSystem')

const server = new net.Server()
const Messages = new MessageFactory()
const config = require('./config.json')
const PORT = config.Server.Port
const Crypto = require("./Crypto")

// Initialize command registry
getCommandRegistry()

// Initialize player storage
const playerStorage = getPlayerStorage()

server.on('connection', async (client) => {
  client.setNoDelay(true)
  client.log = function (text) {
    if (config.Server.Debug) {
      return console.log(`[${this.remoteAddress.split(':').slice(-1)}] >> ${text}`)
    }
    else
    {
      return console.log(`[*] >> ${text}`)
    }
  }

  client.log('A wild connection appeared!')
  client.crypto = new Crypto()
  client.storage = playerStorage
  
  const packets = Messages.getPackets();

  client.on('data', async (packet) => {
    // Check for Flash policy file request
    const packetStr = packet.toString('utf8', 0, Math.min(packet.length, 100))
    if (packetStr.includes('<policy-file-request/>')) {
      client.write('<?xml version="1.0"?><cross-domain-policy><allow-access-from domain="*" to-ports="*" secure="false"/></cross-domain-policy>\0')
      client.log('Flash policy request handled')
      return
    }

    const id = packet.readUInt16BE(0)
    const len = packet.readUIntBE(2, 3)

    const message = {
      id: id,
      len: len,
      payload: packet.slice(5, 5 + len),
      client,
    }

    // Client sends encrypted packets
    message.payload = await client.crypto.decrypt(message.payload)

    if (packets.indexOf(String(message.id)) !== -1) {
      try {
        const packet = new (Messages.handle(message.id))(message.payload, client)

        if (config.Server.Debug) {
          client.log(`Gotcha ${message.id} (${packet.constructor.name}) packet! `)
        }

        await packet.decode()
        await packet.process()
      } catch (e) {
        client.log(`Packet processing error for ID ${message.id}: ${e.message}`)
        console.log(e.stack)
      }
    } else {
      client.log(`Gotcha undefined ${message.id} packet! (hex: 0x${message.id.toString(16)})`)
    }
  })

  client.on('end', async () => {
    // Stop resource regeneration for this player
    const regenerationSystem = getResourceRegeneration()
    regenerationSystem.stopRegeneration(client)
    
    // Stop buff/debuff ticker for this player
    const buffSystem = getBuffDebuffSystem()
    buffSystem.stopBuffTicker(client)
    
    return client.log('Client disconnected.')
  })

  client.on('error', async error => {
    try {
      client.log('A wild error!')
      console.log(error)
      client.destroy()
    } catch (e) { }
  })
})

console.log(figlet.textSync('Gunshine.net'))
console.log(`[SERVER] >> Initializing Gunshine.net on port ${PORT}...`)
console.log(`[SERVER] >> Command Registry loaded`)
console.log(`[SERVER] >> Player Storage initialized (In-Memory)`)

server.once('listening', () => console.log(`[SERVER] >> Server started on ${PORT} port!`))
server.listen(PORT)

process.on("uncaughtException", e => console.log(e));
process.on("unhandledRejection", e => console.log(e));
