const fs = require('fs')

const prompt = require('prompt')
const chalk = require('chalk')

const readConfig = () => {
	const configJSON = fs.readFileSync('./config.json').toString()
	try {
		return JSON.parse(configJSON)
	} catch (err) {
		console.log(chalk.red('ERROR - config.json is empty or corrupted'))
		console.log(chalk.red.italic('Use app.js config to save new configuration'))
		return {}
	}
}

const setConfig = (list) => {
	if (list) {
		console.log(chalk.greenBright.inverse(' *** Current client config *** '))
		console.log(readConfig())
	} else {
		console.log(
			chalk.cyanBright(
				'This utility will walk you through client configuration stored in config.json file.\nPress enter to confirm current value shown in ()'
			)
		)
		const configObj = readConfig()
		prompt.start()
		prompt.get(
			[
				{
					name: 'statusPath',
					description: chalk.greenBright('Relative path to file with status table'),
					type: 'string',
					default: configObj.statusPath,
				},
				{
					name: 'historyPath',
					description: chalk.greenBright('Relative path to file with history table'),
					type: 'string',
					default: configObj.historyPath,
				},
				{
					name: 'serverAddress',
					description: chalk.greenBright('HTTP address of the server'),
					type: 'string',
					default: configObj.serverAddress,
				},
			],
			(err, result) => {
				if (err) {
					return onError(err)
				}
				const newConfigJSON = JSON.stringify(result)
				fs.writeFile('./config.json', newConfigJSON, () => {
					console.log(chalk.blue('     !!!   SUCCESS   !!!   '))
					console.log(chalk.greenBright.inverse(' *** Current client config *** '))
					console.log(readConfig())
				})
			}
		)
	}
}

const onError = (err) => {
	console.log(err)
	return 1
}

module.exports = {
	readConfig: readConfig,
	setConfig: setConfig,
}
