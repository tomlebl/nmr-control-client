const fs = require('fs')
const { io } = require('socket.io-client')
const { v4: uuidv4 } = require('uuid')

const { readConfig } = require('./config')

const { instrumentId, submissionPath } = readConfig()
const socket = io('http://localhost:8080', {
	query: { instrumentId }
})

const submitter = () => {
	socket.on('create', data => {
		let submissionFile = ''
		JSON.parse(data).forEach(entry => {
			submissionFile =
				submissionFile +
				`
USER ${entry.group}
			
HOLDER ${entry.holder}					
NAME ${entry.sampleId}
SOLVENT ${entry.solvent}
NO_SUBMIT

EXPNO ${entry.expNo}
EXPERIMENT ${entry.parameterSet}
TITLE ${entry.title}

`
		})
		fs.writeFileSync(submissionPath + uuidv4() + '-c', submissionFile + 'END')
	})
}

module.exports = submitter
