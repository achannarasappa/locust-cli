#!/usr/bin/env node
/* eslint-disable no-shadow, no-unused-vars, arrow-body-style, implicit-arrow-linebreak */
/* eslint-disable no-unused-expressions */
const yargs = require('yargs');
const run = require('../lib/run');
const start = require('../lib/start');
const generate = require('../lib/generate');
const validate = require('../lib/validate');
const stop = require('../lib/stop');
const info = require('../lib/info');

yargs
  .scriptName('locust')
  .command('run', 'run in single job mode', (yargs) => {

    return yargs
      .command('*', false, (yargs) => {

        return yargs
          .option('includeHtml', {
            describe: 'include html in the response',
            default: false,
          })
          .option('includeLinks', {
            describe: 'include links in the response',
            default: false,
          })
          .option('includeCookies', {
            describe: 'include cookies in the response',
            default: false,
          })
          .alias('t', 'includeHtml')
          .alias('l', 'includeLinks')
          .alias('c', 'includeCookies')
          .demandCommand(1, 'A file path to a job file is required')
          .usage('locust run <path_to_file>')
          .example('locust run job.js', 'Runs a single job and returns the results')
          .example('locust run job.js -l -t -c', 'Include all response fields')
          .help();

      }, async ({
        _: [cmd, filePath], includeHtml, includeLinks, includeCookies,
      }) => {

        return run(filePath, includeHtml, includeLinks, includeCookies);

      });

  })
  .command('start', 'starts a job and crawls until a stop condition is met', (yargs) => {

    return yargs
      .command('*', false, (yargs) => {

        return yargs
          .option('bootstrap', {
            describe: 'Start redis and browserless Docker containers if not already available',
            default: false,
          })
          .option('reset', {
            describe: 'Reset queue state before starting',
            default: false,
          })
          .alias('b', 'bootstrap')
          .alias('r', 'reset')
          .demandCommand(1, 'A file path to a job file is required')
          .usage('locust start <path_to_file>')
          .example('locust start job.js', 'Starts a job')
          .example('locust start -b job.js', 'Starts redis and browserless containers if they are not already running')
          .help();

      }, ({ _: [cmd, filePath], bootstrap, reset }) => {

        return start(filePath, bootstrap, reset);

      });

  })
  .command('stop', 'Stop running jobs and stop redis and browserless containers', (yargs) => {

    return yargs
      .command('*', false, (yargs) => {

        return yargs
          .usage('locust stop')
          .help();

      }, ({ _: [cmd, filePath], bootstrap }) => {

        return stop(filePath, bootstrap);

      });

  })
  .command('generate', 'generate a job definition through a series of prompts', (yargs) => yargs, () => {

    return generate();

  })
  .command('validate', 'validate a job definition', (yargs) => {

    return yargs
      .command('*', false, (yargs) => {

        return yargs
          .demandCommand(1, 'A file path to a job file is required')
          .usage('locust validate <path_to_file>')
          .example('locust validate job.js', 'Validates a job and outputs any issues')
          .help();

      }, ({ _: [cmd, filePath] }) => {

        return validate(filePath);

      });

  })
  .command('info', 'information on queue state and jobs in each status', (yargs) => {

    return yargs
      .command('*', false, (yargs) => {

        return yargs
          .demandCommand(1, 'A file path to a job file is required')
          .usage('locust info')
          .example('locust info', 'snapshot of current queue state')
          .help();

      }, async ({ _: [cmd, filePath] }) => {

        console.log(cmd);

        return info(filePath);

      });

  })
  .alias('v', 'version')
  .alias('h', 'help')
  .demandCommand(1, 'A command is required')
  .usage('locust <command>')
  .help()
  .argv;
