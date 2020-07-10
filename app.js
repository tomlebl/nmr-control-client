const yargs = require('yargs')

const tracker = require('./tracker')
const config = require('./config')

yargs.command({
  command: 'config',
  describe: 'Client configuration',
  builder: {
    list: {
      alias: 'l',
      describe: 'List configuration file',
      type: 'boolean'
    }
  },
  handler(argv) {
    config.setConfig(argv.list)
  }
})

yargs.command({
  command: 'run',
  describe: 'Start client',
  builder: {
    verbose: {
      alias: 'v',
      describe: 'Client running with console logs',
      type: 'boolean'
    }
  },
  handler(argv) {
    tracker(argv.verbose)
  }
})

yargs.parse()
