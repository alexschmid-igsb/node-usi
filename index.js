const unidecode = require('unidecode')
const lodash = require('lodash')

const countryCodes = require('./country_codes')
const countryCodesGroup = '(' + countryCodes.map(entry => entry.code).join('|') + ')'

const sampleTypes = require('./sample_types.json')
const sampleTypesGroup = '(' + sampleTypes.map(entry => entry.code).join('|') + ')'

const USI_PATTERN = new RegExp(`^${countryCodesGroup}([A-Z]{3})([A-Z]{3})(\\d{1,5})$`)
const LABCODE_PATTERN = new RegExp(`^${countryCodesGroup}(\\d\\d)([A-Z]{3})([A-Z]{3})${sampleTypesGroup}([1-9])(\\d{5})$`)

console.log(USI_PATTERN)
console.log(LABCODE_PATTERN)

function buildUSI(countryCode, studyCode, centerCode, sampleId) {
    return {
        elements: {
            countryCode: countryCode,
            studyCode: studyCode,
            centerCode: centerCode,
            sampleId: sampleId
        },
        toString: function() {
            return `${this.elements.countryCode}${this.elements.studyCode}${this.elements.centerCode}${this.elements.sampleId.toString().padStart(5,'0')}`
        }
    }
}

function buildLabCode(countryCode, studyCode, centerCode, sampleId, checksumString, sampleType, aliquotSequence) {
    return {
        elements: {
            countryCode: countryCode,
            checksum: checksumString,
            studyCode: studyCode,
            centerCode: centerCode,
            sampleType: sampleType,
            aliquotSequence: aliquotSequence,
            sampleId: sampleId
        },
        toString: function() {
            return `${this.elements.countryCode}${this.elements.checksum}${this.elements.studyCode}${this.elements.centerCode}${this.elements.sampleType}${this.elements.aliquotSequence}${this.elements.sampleId.toString().padStart(5,'0')}`
        }
    }
}

function calculateChecksum(labCode) {

    // build input string
    const inputString = `${labCode.elements.studyCode}${labCode.elements.centerCode}${labCode.elements.sampleType}${labCode.elements.aliquotSequence}${labCode.elements.sampleId.toString().padStart(5,'0')}${labCode.elements.countryCode}${labCode.elements.checksum}`

    // transform input string to numeric code
    let arr = []
    for(let c of inputString) {
        if(c.charCodeAt(0) >=65 && c.charCodeAt(0) <= 90) {
            arr.push((c.charCodeAt(0)-55).toString())
        } else if(c.charCodeAt(0) >= 48 && c.charCodeAt(0) <= 57) {
            arr.push((c.charCodeAt(0)-48).toString())
        } else {
            throw new Error(`illegal character: ${c}`)
        }
    }
    const numeric = BigInt(arr.join(''))

    // calculate checksum
    const mod = Number(numeric % 97n)
    const checksum = 98 - mod

    return {
        number: checksum,
        string: checksum.toString().padStart(2,'0')
    }
}

function parseUSIString(usiString) {
    if (usiString == null) {
        throw new Error('USI must not be null or undefined')
    }

    if(lodash.isString(usiString) === false) {
        throw new Error(`USI must be type 'string' but found type '${typeof usiString}' instead`)
    }

    usiString = unidecode(usiString)
    usiString = usiString.toUpperCase()

    const result = usiString.match(USI_PATTERN)

    if(result == null) {
        throw new Error('USI syntax error')
    } 

    return buildUSI(result[1], result[2], result[3], parseInt(result[4]))
}

function parseLabCodeString(labCodeString) {
    if (labCodeString == null) {
        throw new Error('LabCode must not be null or undefined')
    }

    if(lodash.isString(labCodeString) === false) {
        throw new Error(`LabCode must be type 'string' but found type '${typeof labCodeString}' instead`)
    }

    labCodeString = unidecode(labCodeString)
    labCodeString = labCodeString.toUpperCase()

    const result = labCodeString.match(LABCODE_PATTERN)

    if(result == null) {
        throw new Error('LabCode syntax error')
    }

    let labCode = buildLabCode(result[1], result[3], result[4], parseInt(result[7]), result[2], result[5], result[6])

    const checksum = calculateChecksum(labCode)
    labCode.isValid = checksum.number === 97

    return labCode
}

function generateLabCode(usiString, sampleType, aliquotSequence = 1) {

    // parse usi
    usi = parseUSIString(usiString)

    // check sample type
    if(lodash.isString(sampleType) === false || sampleTypes.map(entry => entry.code).includes(sampleType.toUpperCase()) === false) {
        throw new Error(`Invalid SampleType. Value is '${sampleType}', type is '${typeof sampleType}'.\n\n       SampleType must be one of the following:\n${sampleTypes.map(entry => `          '${entry.code}' for ${entry.type}`).join('\n')}\n`)
    }
    sampleType = sampleType.toUpperCase()

    // check aliquot sequence
    if(lodash.isInteger(aliquotSequence) && aliquotSequence >= 1 && aliquotSequence <= 9) {
        // valid (ingeger)
    } else if(lodash.isString(aliquotSequence) && parseInt(aliquotSequence) >= 1 && parseInt(aliquotSequence) <= 9) {
        // valid (string)
        aliquotSequence = parseInt(aliquotSequence)
    } else {
        // invalid
        throw new Error(`Invalid AliquotSequence. Value is '${aliquotSequence}', type is '${typeof aliquotSequence}'.\n       AliquotSequence must be an integer value between 1 and 9 or a string value between '1' and '9'.\n`)
    }

    // create labcode
    let labCode = buildLabCode(usi.elements.countryCode, usi.elements.studyCode, usi.elements.centerCode, usi.elements.sampleId, '00', sampleType, aliquotSequence)

    // calculate checksum
    labCode.elements.checksum = calculateChecksum(labCode).string

    return labCode
}

module.exports = {

    // Parse and validate the given USI string. Returns an USI object.
    parseUSIString: parseUSIString,

    // Parse and validate the given LabCode string. Returns an LabCode object.
    parseLabCodeString: parseLabCodeString,

    // Generate a LabCode object for a given USI string.
    generateLabCode: generateLabCode
}