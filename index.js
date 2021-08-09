
const { Command } = require('commander');
const fetch = require('node-fetch');
const nslookup = require('nslookup');
const dns = require('dns').promises;
// const ICMP = require('icmp');
const { writeToNewFile, getDateForFileName, readFile } = require('./fileIO');
// const { name, tests } = require('./tests/test1');

const program = new Command();



function waitForMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const childSiteRegex = /a/;
function getChildSite(url) {
    const match = childSiteRegex.exec(url);
    if (match == null) return '';

    return '%CHILD_SITE%';
}


program
    .version('1.0.0')
    .arguments('[filename]')
    .option('--log-fetch', 'output fetch and redirect logs')
    .option('-f, --fail-report', 'Generate failure reports')
    .option('-s, --force-https', 'Use https:// even if the test case Requires http://')
    .option('-j, --json-only', 'Only generate result in JSON format. Skips generating human-readable report')
    .option('-c, --child-sites-count <count>', '(Default: 3) Number of random child sites to test.', (a, _) => Number(a), '3')
    // .option('-p, --pizza-type <type>', 'flavour of pizza');
    ;

program.action(async (_filename, options) => {
    const { logFetch, failReport, forceHttps, jsonOnly, childSitesCount } = options;
    console.log('childSitesCount', typeof childSitesCount);
    const filename = _filename || 'tests/test1.jsonc';
    console.log('Run test from %s', filename);

    const testsRawString = await readFile(filename);
    const testsString = testsRawString.replace(/\r\n/g, '\n').replace(/(?<=\n)\s*\/\/.+?\n/g, '\n');

    // console.log('testsString', testsString);
    const file = JSON.parse(testsString);
    const { name, descriptions, tests } = file;

    console.log('Test count: %s', tests.length);

    const ip = (await dns.lookup('www.executivecentre.com'))?.address;
    console.log('ip address: ' + ip);

    const resultList = [];
    let index = 0;
    for (const test of tests) {
        const {
            input,
            expect,
            notes = '',

            // // treats "https://www.executivecentre.com/en-au/private-office/" and "/en-au/private-office/" to be the same, but not "/private-office/"
            // expectStrictHostName = false,

            // treats "https://www.executivecentre.com/en-au/private-office/?repeat=w3tc" and "https://www.executivecentre.com/en-au/private-office/" to be the same
            expectStrictQueryString,
        } = test;

        const result = {
            index: ++index,
            input,
            expect,
            notes,
            // expectStrictHostName,
            expectStrictQueryString,
            checkQueryString: false,
            hops: [],
            pass: false,
            timeout: false,
            error: '',
        };

        const checkQueryString = expectStrictQueryString ?? (expect.includes('?'));
        result.checkQueryString = checkQueryString;

        let resp;
        let url = input;
        const childSite = getChildSite(url);
        let trial = 0;
        do {
            trial++;
            url = url.replace(/%CHILD_SITE%/g, `%CHILD_SITE%`);
            if (forceHttps) {
                url = url.replace(/^http:\/\//, 'https://');
            }

            let testUrl = url;
            let expectUrl = expect;

            if (!checkQueryString) {
                testUrl = testUrl.split('?')[0];
            }
            if (!checkQueryString) {
                expectUrl = expectUrl.split('?')[0];
            }
            result.pass = (testUrl === expectUrl);


            if (logFetch) console.log(`fetch ${url}`);
            try {
                resp = await fetch(url, { method: 'HEAD', redirect: 'manual' });

                // console.log('resp.headers', resp.headers);
                url = resp.headers.get('location');
                if (url) {
                    if (logFetch) console.log('redirected');
                    result.hops.push(url);
                } else {
                    url = '';
                }
            } catch (e) {
                console.warn('Error', e);
                result.error = '' + e;
                url = '';
            }
            await waitForMs(10);
        } while (url !== '' && trial < 20);

        if (trial >= 20) result.timeout = true;

        console.log(`${result.index}. ${result.pass ? 'OK' : result.timeout ? 'Failed timeout' : 'Failed'} (${result.hops.length} Hop${result.hops.length > 1 ? 's' : ''})`);
        if (!result.pass) console.log(`  failed: ${input}`);
        resultList.push(result);
    }
    const dateString = getDateForFileName(new Date());

    const passed = resultList.filter(result => result.pass).length;
    const oneHops = resultList.filter(result => result.pass && result.hops.length <= 1).length;
    const total = resultList.length;

    const resultHeaderJSON = {
        name,
        filename,
        descriptions,
        dateString,
        options,
        ip,
        total,
        passed,
        oneHops,
    };

    const resultHeader = `${name}\n` +
        `File name: ${filename}\n` +
        `Descriptions: ${descriptions}\n` +
        `Date: ${dateString}\n` +
        `Options: ${JSON.stringify(options)}\n` +
        `IP: ${ip}\n` +
        `Passed: ${passed} / ${total} (${Math.floor(passed / total * 100)}%)\n` +
        `Failed: ${total - passed}\n` +
        `1-Hop-Pass: ${oneHops} / ${passed} (${passed <= 0 ? 0 : Math.floor(oneHops / passed * 100)}%)`
        ;


    const resultString = `${resultHeader}\n` +
        `=======================================\n` +
        `\n` +
        generateReport(resultList, options) + `\n`;

    const failureList = resultList.filter(result => !result.pass);
    const failureString = `${resultHeader}\n` +
        `=======================================\n` +
        `\n` +
        generateReport(failureList, options) + `\n`;

    console.log(
        `=======================================\n` +
        `\n` +
        `${resultHeader}\n` +
        'Done'
    );

    if (!jsonOnly) await writeToNewFile(`./output/redirect_result_${dateString}.txt`, resultString);
    writeToNewFile(
        `./output/redirect_result_${dateString}.json`,
        JSON.stringify({ summary: resultHeaderJSON, result: resultList }, null, 4)
    );

    if (failReport && !jsonOnly) writeToNewFile(`./output/redirect_result_${dateString}_failed.txt`, failureString);
    if (failReport) {
        writeToNewFile(
            `./output/redirect_result_${dateString}_failed.json`,
            JSON.stringify({ summary: resultHeaderJSON, failed: failureList }, null, 4)
        );
    }

});

program.parse(process.argv);



function generateReport(resultList, options) {
    const { logFetch, failReport, forceHttps, childSitesCount } = options;
    return (resultList.map(line => {
        const {
            index,
            input,
            expect,
            notes,
            // expectStrictHostName,
            // expectStrictQueryString,
            checkQueryString,
            hops,
            pass,
            timeout,
            error,
        } = line;
        const flags = [
            // expectStrictHostName ? 'expectStrictHostName' : '',
            checkQueryString ? 'checkQueryString' : '',
            forceHttps ? 'forceHttps' : '',
        ].filter(line => line);
        return [
            `${('' + (index) + '.').padEnd(6, ' ')}  ${input}`,
            hops.map((hop, i) => `      > ${hop}`).join('\n'),
            `Expect: ${expect}`,
            [
                (notes === '' ? '' : `Notes: ${notes}`),
                'Flags: ' + JSON.stringify(flags)
            ].filter(a => a).join(', '),
            error === '' ? null : error,
            `${pass ? 'OK' : timeout ? 'Failed timeout' : 'Failed'} (${hops.length} Hop${hops.length > 1 ? 's' : ''})`,
        ].filter(line => line != null).join('\n');
    })).join('\n\n');
}