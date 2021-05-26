const { Command } = require('commander');
const fetch = require('node-fetch');
const { writeToNewFile, getDateForFileName, readFile } = require('./fileIO');
// const { name, tests } = require('./tests/test1');

const program = new Command();



function waitForSeconds(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const childSiteRegex = /a/;
function getChildSite(url) {
    const match = childSiteRegex.exec(url);
    if (match == null) return '';
}


program
    .version('1.0.0')
    .arguments('[filename]')
    .option('--fetch', 'output fetch and redirect logs')
    // .option('-s, --small', 'small pizza size')
    // .option('-p, --pizza-type <type>', 'flavour of pizza');
    ;

program.action(async (_filename, options) => {
    const filename = _filename || 'tests/test1.jsonc';
    console.log('Run test from %s', filename);

    const testsRawString = await readFile(filename);
    const testsString = testsRawString.replace(/\r\n/g, '\n').replace(/(?<=\n)\s*\/\/.+?\n/g, '\n');

    // console.log('testsString', testsString);
    const file = JSON.parse(testsString);
    const { name, descriptions, tests } = file;

    const resultList = [];
    let index = 0;
    for (const test of tests) {
        const {
            input,
            expect,
            notes = '',

            // treats "https://www.executivecentre.com/en-au/private-office/" and "/en-au/private-office/" to be the same, but not "/private-office/"
            expectStrictHostName = false,

            // treats "https://www.executivecentre.com/en-au/private-office/?repeat=w3tc" and "https://www.executivecentre.com/en-au/private-office/" to be the same
            expectStrictQueryString = false,
        } = test;

        const result = {
            index: ++index,
            input,
            expect,
            notes,
            expectStrictHostName,
            expectStrictQueryString,
            hops: [],
            pass: false,
            timeout: false,
        };

        let resp;
        let url = input;
        let trial = 0;
        do {
            trial++;
            let testUrl = url;
            const childSite = getChildSite(testUrl);

            let expectUrl = expect;
            if (expectStrictQueryString) {
                testUrl = testUrl.split('');
            }
            result.pass = (testUrl === expectUrl);

            if (options.fetch) console.log(`fetch ${url}`);
            resp = await fetch(url, { redirect: 'manual' });

            // console.log('resp.headers', resp.headers);
            url = resp.headers.get('location');
            if (url) {
                if (options.fetch) console.log('redirected');
                result.hops.push(url);
            } else {
                url = '';
            }
            await waitForSeconds(10);
        } while (url !== '' && trial < 20);

        if (trial >= 20) result.timeout = true;

        console.log(`${result.index}.  ${result.pass ? 'OK' : result.timeout ? 'Timeout' : 'Failed'} (${result.hops.length} Hops)\n`);
        resultList.push(result);
    }

    const passed = resultList.filter(result => result.pass).length;
    const oneHops = resultList.filter(result => result.pass && result.hops.length <= 1).length;
    const total = resultList.length;

    const resultString = `${name}\n` +
        `File name: ${filename}\n` +
        `Descriptions: ${descriptions}\n` +
        `Date: ${new Date().toISOString()}\n\n` +
        `Passed: ${passed} / ${total} (${Math.floor(passed / total * 100)}%)\n` +
        `Failed: ${total - passed}\n` +
        `1-Hop-Pass: ${oneHops} / ${passed} (${Math.floor(oneHops / passed * 100)}%)\n` +
        `\n` +
        (resultList.map(line => {
            const {
                index,
                input,
                expect,
                notes,
                expectStrictHostName,
                expectStrictQueryString,
                hops,
                pass,
                timeout,
            } = line;
            const flags = [
                expectStrictHostName ? 'expectStrictHostName' : '',
                expectStrictQueryString ? 'expectStrictQueryString' : '',
            ].filter(line => line);
            return [
                `${('' + (index) + '.').padEnd(6, ' ')}  ${input}`,
                hops.map((hop, i) => `      > ${hop}`).join('\n'),
                `Expect: ${expect}`,
                [
                    (notes === '' ? '' : `Notes: ${notes}`),
                    'Flags: ' + JSON.stringify(flags)
                ].filter(a => a).join(', '),
                `${pass ? 'OK' : timeout ? 'Timeout' : 'Failed'} (${hops.length} Hops)`,
            ].join('\n');
        })).join('\n\n');

    const dateString = getDateForFileName(new Date());
    writeToNewFile(`./output/redirect_result_${dateString}.txt`, resultString);
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log(resultString);
    // console.log('');
    // console.log('');
})
    ;

program.parse(process.argv);

