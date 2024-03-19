const usi = require('./index')


// TEST 1: Parse USI
const parseUsi = function(usiString) {
    try {
        console.log('Input:')
        console.log(usiString)

        let result = usi.parseUSIString(usiString)
        console.log()
        console.log('Output:')
        console.log(result)
        console.log(result.toString())
    } catch(err) {
        console.log(err.message)
    }
    console.log()
}
for(let usiString of [
    'ITUITAKB47183',
    'EXUWAZZZ5',
    'DETSTUKB123456',
    'dEtStüKB123',
]) {
    parseUsi(usiString)
}


// TEST 2: Parse and validate LabCodes
const parseLabCode = function(labCodeString) {
    try {
        console.log('Input:')
        console.log(labCodeString)

        let result = usi.parseLabCodeString(labCodeString)
        console.log()
        console.log('Output:')
        console.log(result)
        console.log(result.toString())
    } catch(err) {
        console.log(err.message)
    }
    console.log()
}
for(let labCodeString of [
    'DE80ANGUKBD100380',
    'IT25ACHUPAD100021',
    'DE07AAAZIMD104491',
    'CA34BIPHALD100011',
    'PL05KONPOZD100560',
    'SE30EEKUKBD100004',
    'PL91KONPOZD100564',
    'PL37KONPOZD100566',
    'DE60MDDGSKD100321',
    'GH17FILUKBD100042',    // invalid
    'AU02BIPSYDD100416',    // invalid
    'DE35ASJMUCD10065',     // error
    'ROA5BIPPHBD100325'     // error
]) {
    parseLabCode(labCodeString)
}


// TEST 3: generate labcodes
const generateLabCode = function(usiString,sampleType,aliquotSequence) {
    try {
        console.log('Input:')
        console.log(usiString + ", " + sampleType + ", " + aliquotSequence )

        let result = usi.generateLabCode(usiString, sampleType, aliquotSequence)
        console.log()
        console.log('Output:')
        console.log(result)
        console.log(result.toString())
    } catch(err) {
        console.log(err.message)
    }
    console.log()
}
for(let item of [
    { usiString: 'DENGSUKB42601', sampleType: 'D', aliquotSequence: 1},
    { usiString: 'DENGSUKB42607', sampleType: 'D', aliquotSequence: 1},
    { usiString: 'DENGSUKB42499', sampleType: 'R', aliquotSequence: 1},
    { usiString: 'DENGSUKB42500', sampleType: 'R', aliquotSequence: 1},
    { usiString: 'DENGSUKB42595', sampleType: 'D', aliquotSequence: 1}
]) {
    generateLabCode(item.usiString, item.sampleType, item.aliquotSequence)
}
