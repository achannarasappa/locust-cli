const locust = require('@achannarasappa/locust');
const dashboard = require('@achannarasappa/locust-cli-dashboard');
const executeWithProgressReporting = require('./job-reporter');

const _refreshQueue = (redis, jobDefinition, renderer) => setInterval(async () => {

  const snapshot = await locust.queue.getSnapshot(redis, jobDefinition.config.name);
  dashboard.queue.updateQueue(renderer, snapshot);

}, 1000);

const start = (
  redisDbQueue,
  redisDbResult,
  jobDefinition,
  onTerminalExit,
) => new Promise((resolve) => {

  let queueRefreshInterval;
  const terminal = dashboard.start(async () => {

    clearInterval(queueRefreshInterval);
    await onTerminalExit();
    resolve();

  });
  const renderer = dashboard.summary.render(terminal);

  queueRefreshInterval = _refreshQueue(redisDbQueue, jobDefinition, renderer);

  renderer.summary.updateMessage('Running');

  executeWithProgressReporting(redisDbResult, jobDefinition, renderer);

});

module.exports = {
  start,
};
