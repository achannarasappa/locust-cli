const shell = require('shelljs');
const R = require('ramda');
const Redis = require('ioredis');
const fs = require('fs');
const moment = require('moment');
const { queue } = require('@achannarasappa/locust');
const reporting = require('./reporting');
const { filterJobResult } = require('../util');

const _bootstrap = () => {

  console.log('Starting redis and chrome...');

  if (!shell.which('docker')) {

    console.log('docker is missing from the system!');
    return;

  }

  if (!shell.which('docker-compose')) {

    console.log('docker-compose is missing from the system!');
    return;

  }

  const { code } = shell.exec(`docker-compose -f ${__dirname}/docker-compose.yml up -d`);

  if (code === 0)
    return console.log(['Successfully started redis and chrome', 'Ready to start a job'].join('\n'));

  return console.log(`Failed to start dependencies with code ${code}`);

};

const _reset = async (redisDbQueue, redisDbResult, jobDefinition) => {

  await queue.remove(redisDbQueue, jobDefinition.config.name);
  await redisDbResult.del('results');

};

const _getResults = async (redisDbResult) => redisDbResult.lrange('results', 0, -1)
  .then(R.map(JSON.parse))
  .then(R.map((jobResult) => filterJobResult(jobResult, false, true, false, false)));

/* istanbul ignore next line */
const _onExit = (redisDbQueue, redisDbResult, jobDefinition) => async () => {

  /* istanbul ignore next line */
  if (redisDbQueue.status === 'ready') {

    await queue.stop(redisDbQueue, jobDefinition.config.name);
    await redisDbQueue.quit();

  }
  /* istanbul ignore next line */
  if (redisDbResult.status === 'ready')
    await redisDbResult.quit();

};

const start = async (filePath, bootstrap) => {

  // eslint-disable-next-line import/no-dynamic-require, global-require
  const jobDefinition = require(`${process.cwd()}/${filePath}`);

  if (bootstrap)
    return _bootstrap();

  try {

    const redisDbQueue = await new Redis(jobDefinition.connection.redis);
    const redisDbResult = await new Redis(R.mergeRight(jobDefinition.connection.redis, {
      db: 1,
    }));

    await _reset(redisDbQueue, redisDbResult, jobDefinition);

    await reporting.start(
      redisDbQueue,
      redisDbResult,
      jobDefinition,
      _onExit(redisDbQueue, redisDbResult, jobDefinition),
    );

    const jobResults = await _getResults(redisDbResult);

    fs.writeFileSync(`./results-${moment().format('YYYY-MM-DD-HH-mm-ss')}.json`, JSON.stringify(jobResults));

    return;

  } catch (e) {

    fs.appendFileSync('log.txt', [
      '\n',
      e.name,
      e.url,
      e.message,
      e.stack,
    ].join('\n'));

  }

};

module.exports = start;
