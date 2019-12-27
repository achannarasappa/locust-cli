/* istanbul ignore file */
const Redis = require('ioredis');
const dashboard = require('@achannarasappa/locust-cli-dashboard');

const info = async (filePath) => {

  // eslint-disable-next-line import/no-dynamic-require, global-require
  const jobDefinition = require(`${process.cwd()}/${filePath}`);
  const redis = await new Redis(jobDefinition.connection.redis);
  const term = dashboard.start(() => redis.quit());
  const renderer = dashboard.summary.render(term);

  renderer.summary.updateMessage('Not attached', 'yellow');

  await new Promise(() => dashboard.queue.refreshQueue(redis, jobDefinition, renderer));

};

module.exports = info;
