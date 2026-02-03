const PiranhaMessage = require('../../PiranhaMessage')

/**
 * StartLogicMessage (20405)
 * 
 * Sent to client after LevelLoadedMessage (10405) to start the game logic.
 * Contains the game calendar/time.
 * 
 * Client class: package_57.class_170
 * 
 * Structure:
 * - LogicGameCalendar (class_125): 8 ints
 *   - int year
 *   - int month (1-12)
 *   - int week
 *   - int day (1-31)
 *   - int hour (0-23)
 *   - int minute (0-59)
 *   - int dayOfYear (1-366)
 *   - int milliseconds
 * 
 * When received, client calls:
 *   class_174.getInstance().method_20().method_84().method_1283(calendar)
 *   class_174.getInstance().method_20().method_1417()
 */
class StartLogicMessage extends PiranhaMessage {
  constructor(client) {
    super()
    this.id = 20405
    this.client = client
    this.version = 0
  }

  async encode() {
    // Get current time
    const now = new Date()
    
    // LogicGameCalendar (class_125) - 8 ints
    this.writeInt(now.getFullYear())           // year
    this.writeInt(now.getMonth() + 1)          // month (1-12)
    this.writeInt(this.getWeekOfYear(now))     // week of year
    this.writeInt(now.getDate())               // day of month (1-31)
    this.writeInt(now.getHours())              // hour (0-23)
    this.writeInt(now.getMinutes())            // minute (0-59)
    this.writeInt(this.getDayOfYear(now))      // day of year (1-366)
    this.writeInt(now.getMilliseconds())       // milliseconds
  }

  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date - start
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
  }

  getWeekOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 1)
    const diff = date - start
    const oneWeek = 1000 * 60 * 60 * 24 * 7
    return Math.floor(diff / oneWeek) + 1
  }
}

module.exports = StartLogicMessage
