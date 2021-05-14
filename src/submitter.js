const fs = require('fs')
const { io } = require('socket.io-client')
const { v4: uuidv4 } = require('uuid')

const { readConfig } = require('./config')

const { instrumentId, submissionPath, serverAddress } = readConfig()

const socket = io(serverAddress, {
	query: { instrumentId }
})

const submitter = () => {
	socket.on('book', data => {
		const dataObj = JSON.parse(data)
		let submissionFile = `USER ${dataObj[0].group}`

		dataObj.forEach(entry => {
			submissionFile += `
		
HOLDER ${entry.holder}
NAME ${entry.sampleId}
SOLVENT ${entry.solvent}
TITLE ${entry.title}
NO_SUBMIT
		`
			entry.experiments.forEach(exp => {
				const params = exp.params ? `PARAMETERS ${exp.params}` : ``
				const night = entry.night ? 'NIGHT' : ``
				submissionFile += `
EXPNO ${exp.expNo}
EXPERIMENT ${exp.paramSet}
TITLE ${exp.expTitle}
		${params}
		${night}		
		`
			})
		})
		submissionFile += `		
END`

		fs.writeFileSync(submissionPath + uuidv4() + '-b', submissionFile)
	})

	socket.on('delete', data => {
		let submissionFile = ''
		JSON.parse(data).forEach(holder => {
			submissionFile += `
HOLDER ${holder}
DELETE
			`
		})
		submissionFile += `
END`
		fs.writeFileSync(submissionPath + uuidv4() + '-d', submissionFile)
	})
}

module.exports = submitter
