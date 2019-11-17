const Redis = require('ioredis');
const { refreshQueue } = require('../term/queue');
const { start } = require('../term');
const { render } = require('../term/summary');

const info = async (filePath) => {

  // eslint-disable-next-line import/no-dynamic-require, global-require
  const jobDefinition = require(`${process.cwd()}/${filePath}`);
  const redis = await new Redis(jobDefinition.connection.redis);
  const term = start(() => redis.quit());
  const renderer = render(term);

  renderer.summary.updateMessage('Not attached', 'yellow');

  await new Promise(() => refreshQueue(redis, jobDefinition, renderer));

};

module.exports = info;
