const fs = require('fs')
const tableToJSON = require('tabletojson').Tabletojson
const chalk = require('chalk')

const config = require('./config')
const { readConfig } = require('./config')

const tracker = verbose => {
  const { statusPath, historyPath } = readConfig()

  if (fs.existsSync(statusPath)) {
    fs.watchFile(statusPath, () => {
      if (verbose) {
        console.log(
          chalk.blue('parsing status file'),
          chalk.yellow(` [${new Date().toLocaleString()}]`)
        )
      }
      try {
        let statusHTML = fs.readFileSync(statusPath).toString()
        if (statusPath !== historyPath) {
          statusHTML = statusHTML + fs.readFileSync(historyPath).toString()
          console.log('history & status merged')
        }
        const statusConverted = tableToJSON.convert(statusHTML)
        const statusJSON = JSON.stringify(statusConverted)
        fs.writeFileSync('status.json', statusJSON)
      } catch (err) {
        console.log(err)
      }
    })
    console.log(chalk.greenBright(`Tracker watching ${statusPath}`))
    console.log(chalk.cyan.italic('Press Ctrl+C any time to quit'))
  } else {
    console.log(chalk.red.inverse('   Status file path is invalid   '))
  }
}

module.exports = tracker
