const { writeToNewFile, getDateForFileName } = require('./fileIO');
const { name, tests } = require('./tests/test1');



const resultString = `expectStrictHostName,expectStrictQueryString,input,expect\n` +
    (tests.map(line => {
        const {
            input,
            expect,
            expectStrictHostName,
            expectStrictQueryString,
        } = line;
        const flags = [
            expectStrictHostName ? 'expectStrictHostName' : '',
            expectStrictQueryString ? 'expectStrictQueryString' : '',
        ].filter(line => line);
        return `${expectStrictHostName ? 'O' : ''},${expectStrictQueryString ? 'O' : ''},${input},${expect}`;
    })).join('\n');

writeToNewFile(`./output/${'test1'}.csv`, resultString);