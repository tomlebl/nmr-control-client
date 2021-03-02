const fs = require('fs')
const path = require('path')
const tableToJSON = require('tabletojson').Tabletojson
const chalk = require('chalk')
const axios = require('axios')

const { readConfig } = require('./config')

const { instrumentId, statusPath, historyPath, serverAddress } = readConfig()

const statusFileHandler = verbose => {
	if (verbose) {
		console.log(chalk.blue('parsing status file'), chalk.yellow(` [${new Date().toLocaleString()}]`))
	}
	try {
		let statusHTML = fs.readFileSync(statusPath).toString()
		if (statusPath !== historyPath) {
			statusHTML = statusHTML + fs.readFileSync(historyPath).toString()
		}
		const statusObj = {
			instrumentId: instrumentId,
			data: tableToJSON.convert(statusHTML)
		}

		axios
			.patch('http://' + serverAddress + '/tracker/status', statusObj)
			.then(res => {
				if (verbose) {
					if (res.status === 201) {
						console.log(
							chalk.greenBright('Status on server was updated'),
							chalk.yellow(` [${new Date().toLocaleString()}]`)
						)
					}
				}
			})
			.catch(err => {
				console.log(chalk.red('[Server Error]', err))
			})
	} catch (err) {
		console.log(err)
	}
}

//helper functions for dev purposes triggered  by parameter -s
let statusFileCount = 1
let historyFileCount = 1
const saveStatusHandler = () => {
	console.log(`Saving status file number ${statusFileCount}`)
	fs.copyFileSync(statusPath, `./status-save/status-${statusFileCount}.html`)
	statusFileCount++
}
const saveHistoryHandler = () => {
	console.log(`Saving history file number ${statusFileCount}`)
	fs.copyFileSync(historyPath, `./status-save/history-${statusFileCount}.html`)
	historyFileCount++
}

const tracker = (verbose, save) => {
	axios
		.get('http://' + serverAddress + '/tracker/ping/' + instrumentId)
		.then(res => {
			if (res.status === 200) {
				console.log(chalk.greenBright(`Instrument ${res.data.name} is connected to the server`))
				statusFileHandler(verbose)
			}
		})
		.catch(err => {
			console.log(chalk.red('[Server Error]', err, 'Check whether instrument ID is valid'))
		})

	if (fs.existsSync(statusPath)) {
		fs.watchFile(statusPath, () => {
			if (save) {
				if (!fs.existsSync('./status-save/')) {
					fs.mkdirSync('./status-save/')
				}
				saveStatusHandler()
			}
			statusFileHandler(verbose)
		})
		console.log(chalk.greenBright(`Tracker watching ${statusPath}`))
		console.log(chalk.cyan.italic('Press Ctrl+C any time to quit'))
	} else {
		console.log(chalk.red.inverse('   Status file path is invalid   '))
	}

	if (statusPath !== historyPath && fs.existsSync(historyPath) && save) {
		if (!fs.existsSync('./status-save/')) {
			fs.mkdirSync('./status-save/')
		}
		saveHistoryHandler()
	}
}

module.exports = tracker
