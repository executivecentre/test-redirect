
const { Command } = require('commander');
const fetch = require('node-fetch');
const nslookup = require('nslookup');
const dns = require('dns').promises;
// const ICMP = require('icmp');
const { writeToNewFile, getDateForFileName, readFile } = require('./fileIO');
const childSitePool = require('./childSitePool');
// const { name, tests } = require('./tests/test1');

const program = new Command();



function waitForTimeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

    const ip = (await dns.lookup('www.executivecentre.com'))?.address;
    console.log('ip address: ' + ip);

    console.log('Test count: %s', tests.length);

    const resultList = [];
    const result = {
        summary: {
            name,
            filename,
            descriptions,
            dateString: '',
            options,
            ip,
            total: 0,
            passed: 0,
            oneHops: 0,
        },
        results: [],
        fails: [],
    };

    // put an index to each case
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        test.index = `${i + 1}`;
    }


    const expandedTests = [];

    // expand %CHILD_SITE% into full URL for each case
    for (const test of tests) {
        const {
            index,
            input,
            expect,
            notes = '',

            // treats "https://www.executivecentre.com/en-au/private-office/?repeat=w3tc" and "https://www.executivecentre.com/en-au/private-office/" to be the same
            expectStrictQueryString,
        } = test;

        if (input.includes('%CHILD_SITE%') || expect.includes('%CHILD_SITE%')) {
            if (!input.includes('%CHILD_SITE%')) {
                const msg = `Case ${index}: \`input\` needs to have a matching %CHILD_SITE% wildcard. File: ${filename}`;
                throw new Error();
            }
            if (!expect.includes('%CHILD_SITE%')) {
                const msg = `Case ${index}: \`expect\` needs to have a matching %CHILD_SITE% wildcard. File: ${filename}`;
                throw new Error();
            }
            const randomChildSites = getTestedChildSites(childSitePool, childSitesCount);
            // url = url.replace(/%CHILD_SITE%/g, `%CHILD_SITE%`);
            for (let i = 0; i < randomChildSites.length; i++) {
                const randomChildSite = randomChildSites[i];
                const { name: childSiteName, siteUrl } = randomChildSite;

                expandedTests.push({
                    ...test,
                    index: `${test.index}.${i + 1}`,
                    input: test.input.replace(/%CHILD_SITE%/ig, siteUrl),
                    expect: test.expect.replace(/%CHILD_SITE%/ig, siteUrl),
                    childSite: childSiteName,
                });
            }
        } else {
            expandedTests.push(test);
        }
    }

    console.log('Expanded test count after %CHILD_SITE%: %s', expandedTests.length);


    for (const test of expandedTests) {
        const {
            index,
            input,
            expect,
            notes = '',

            // treats "https://www.executivecentre.com/en-au/private-office/?repeat=w3tc" and "https://www.executivecentre.com/en-au/private-office/" to be the same
            expectStrictQueryString,
            childSite,
        } = test;

        const caseResult = {
            index,
            input, // `input` is read-only, the raw input from the test cases
            expect, // `expect` is read-only, the raw expected output from the test cases
            notes,
            expectStrictQueryString,
            checkQueryString: false,
            childSite,
            hops: [],
            pass: false,
            timeout: false,
            error: '',
        };

        const checkQueryString = expectStrictQueryString ?? (expect.includes('?'));
        caseResult.checkQueryString = checkQueryString;

        let resp;
        let url = input; // `url` is the actual url we use to make the request
        let trial = 0;
        do {
            trial++;
            if (forceHttps) {
                url = url.replace(/^http:\/\//, 'https://');
            }

            let testUrl = url; // `testUrl` is the temporary url we use to white list some test case noises
            if (!checkQueryString) {
                testUrl = testUrl.split('?')[0];
            }

            let expectUrl = expect;// `expectUrl` is the temporary url we use to white list some test case noises
            if (!checkQueryString) {
                expectUrl = expectUrl.split('?')[0];
            }
            caseResult.pass = (testUrl === expectUrl);


            if (logFetch) console.log(`fetch ${url}`);
            try {
                resp = await fetch(url, { method: 'HEAD', redirect: 'manual' });

                // console.log('resp.headers', resp.headers);
                url = resp.headers.get('location');
                if (url) {
                    if (logFetch) console.log('redirected');
                    caseResult.hops.push(url);
                } else {
                    url = '';
                }
            } catch (e) {
                console.warn('Error', e);
                caseResult.error = '' + e;
                url = '';
            }
            await waitForTimeout(10);
        } while (url !== '' && trial < 20);

        if (trial >= 20) caseResult.timeout = true;

        console.log(`${caseResult.index}. ${caseResult.pass ? 'OK' : caseResult.timeout ? 'Failed (timeout)' : 'Failed'} (${caseResult.hops.length} Hop${caseResult.hops.length > 1 ? 's' : ''})`);
        if (!caseResult.pass) console.log(`  failed: ${input}`);
        result.results.push(caseResult);
    }
    result.summary.dateString = getDateForFileName(new Date());

    result.summary.passed = result.results.filter(result => result.pass).length;
    result.summary.oneHops = result.results.filter(result => result.pass && result.hops.length <= 1).length;
    result.summary.total = result.results.length;
    result.fails = resultList.filter(result => !result.pass);

    const resultSummary = getResultSummary(result);
    console.log(
        `=======================================\n` +
        `\n` +
        `${resultSummary}\n` +
        'Done'
    );

    if (!jsonOnly) await reportResultAsFile(result);
    reportResultAsJson(result);

    if (failReport) {
        if (!jsonOnly) reportFailsAsFile(result);
    }

});

program.parse(process.argv);


async function reportResultAsFile(result) {
    const {
        summary: {
            name,
            filename,
            descriptions,
            dateString,
            options,
            ip,
            total,
            passed,
            oneHops,
        },
        results,
        fails,
    } = result;

    const resultSummary = getResultSummary(result);
    const resultString = `${resultSummary}\n` +
        `=======================================\n` +
        `\n` +
        generateReport(results, options) + `\n`;
    await writeToNewFile(`./output/redirect_result_${dateString}.txt`, resultString);
}

async function reportResultAsJson(result) {
    writeToNewFile(
        `./output/redirect_result_${result.summary.dateString}.json`,
        JSON.stringify(result, null, 4)
    );
}

async function reportFailsAsFile(result) {
    const {
        summary: {
            name,
            filename,
            descriptions,
            dateString,
            options,
            ip,
            total,
            passed,
            oneHops,
        },
        results,
        fails,
    } = result;

    const resultSummary = getResultSummary(result);
    const failureString = `${resultSummary}\n` +
        `=======================================\n` +
        `\n` +
        generateReport(fails, options) + `\n`;

    await writeToNewFile(`./output/redirect_result_${dateString}_failed.txt`, failureString);
}

function getResultSummary(result) {
    const {
        summary: {
            name,
            filename,
            descriptions,
            dateString,
            options,
            ip,
            total,
            passed,
            oneHops,
        },
        results,
        fails,
    } = result;

    const resultSummary = `${name}\n` +
        `File name: ${filename}\n` +
        `Descriptions: ${descriptions}\n` +
        `Date: ${dateString}\n` +
        `Options: ${JSON.stringify(options)}\n` +
        `IP: ${ip}\n` +
        `Passed: ${passed} / ${total} (${Math.floor(passed / total * 100)}%)\n` +
        `Failed: ${total - passed}\n` +
        `1-Hop-Pass: ${oneHops} / ${passed} (${passed <= 0 ? 0 : Math.floor(oneHops / passed * 100)}%)`
        ;

    return resultSummary;
}

function generateReport(resultList, options) {
    const { logFetch, failReport, forceHttps, childSitesCount } = options;
    return (resultList.map(line => {
        const {
            index,
            input,
            expect,
            notes,
            // expectStrictQueryString,
            checkQueryString,
            childSite,
            hops,
            pass,
            timeout,
            error,
        } = line;
        const flags = [
            checkQueryString ? 'checkQueryString' : '',
            forceHttps ? 'forceHttps' : '',
            childSite ? `CHILD_SITE: ${childSite}` : '',
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
            `${pass ? 'OK' : timeout ? 'Failed (timeout)' : 'Failed'} (${hops.length} Hop${hops.length > 1 ? 's' : ''})`,
        ].filter(line => line != null).join('\n');
    })).join('\n\n');
}



function getTestedChildSites(childSitePool, count) {
    const resultIDs = new Array(childSitePool.length).fill(1).map((_, i) => i);
    const result = [];

    for (let i = 0; i < count; i++) {
        const randomID = Math.floor(Math.random() * resultIDs.length);

        result.push(childSitePool[randomID]);
        resultIDs.splice(randomID, 1);
    }
    return result;
}