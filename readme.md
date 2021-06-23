# Test-Redirect

Nodejs utility to count and verify redirection rules

## How to use

To run:
```sh
node index.js tests/test2.jsonc
```

To save frequent tests and run:
```sh
./run_test2.sh
```


## How to add test cases

1. Clone tests/test2.jsonc
2. Edit the JSON file
3. Run `node index.js` with this new file


## Switches

```
node index.js -h               
Usage: index [options] [filename]

Options:
  -V, --version                    output the version number
  --log-fetch                      output fetch and redirect logs
  -f, --fail-report                Generate failure reports
  -s, --force-https                Use https:// even if the test case Requires http://
  -j, --json-only                  Only generate result in JSON format. Skips generating human-readable report
  -c, --child-sites-count <count>  (Default: 3) Number of random child sites to test. (default: "3")
  -h, --help                       display help for command

```