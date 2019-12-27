<p align="center">
<img align="center" width="100" src="https://locust.dev/img/locust-logo.svg" />
</p>
<h1 align="center">Locust CLI</h2>
<p align="center">
Developer tools to accelerate development of Locust jobs
</p>

## Quick Start

```
npm install @achannarasappa/locust-cli
```

```
❯ locust
locust <command>

Commands:
  locust run       run in single job mode
  locust start     starts a job and crawls until a stop condition is met
  locust stop      Stop running jobs and stop redis and browserless containers
  locust generate  generate a job definition through a series of prompts
  locust validate  validate a job definition
  locust info      information on queue state and jobs in each status

Options:
  -v, --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
```

## Features

### Generate a job definition file

Interactively generate a job definition file with `locust generate` by answering a set of prompts.

### Test CSS selectors and data extraction logic 

Running a job with `locust run` makes a request to the entrypoint url and runs the `extract` hook which is a lightweight way to test that the defined CSS selectors and other data extraction logic works as expected.

### Start a job locally before pushing to a cloud provider

Simulate and debug a job run on a cloud provider without pushing up code or provisioning infrastructure. `locust start` will run a job as it would on a cloud provider and presents a dashboard to help understand what the job is doing and identify potential problem areas.

## Reference

* Reference
  * [API](https://locust.dev/docs/api)
  * [CLI](https://locust.dev/docs/cli)
* [Examples](https://github.com/achannarasappa/locust-examples)
* Related
  * [locust](https://github.com/achannarasappa/locust)
  * [locust-aws-terraform](https://github.com/achannarasappa/locust-aws-terraform)
  * [locust-website](https://github.com/achannarasappa/locust-website)