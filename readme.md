# Test-Redirect


How to use

```sh
./test_redirect.sh
```

How to add test cases

1. Open test_redirect.sh
2. Add a line in this format: `"source expected"`, where
   1. The whole line is enclosed in double quotes
   2. `source` is a fully qualified URL
   3. `expected` is the expected final redirection, can be a partial path
   4. eg:
    `"https://www.executivecentre.com/campaign https://www.executivecentre.com/"`
    `"https://www.executivecentre.com/bespoke/ /enterprise-solutions-serviced-office/"`


