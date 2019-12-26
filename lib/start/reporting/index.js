const locust = require('@achannarasappa/locust');
const termQueue = require('../../term/summary/queue');
const termSummary = require('../../term/summary');
const term = require('../../term');
const executeWithProgressReporting = require('./job-reporter');

const _refreshQueue = (redis, jobDefinition, renderer) => setInterval(async () => {

  const snapshot = await locust.queue.getSnapshot(redis, jobDefinition.config.name);
  termQueue.updateQueue(renderer, snapshot);

}, 1000);

const start = (
  redisDbQueue,
  redisDbResult,
  jobDefinition,
  onTerminalExit,
) => new Promise((resolve) => {

  let queueRefreshInterval;
  const terminal = term.start(async () => {

    clearInterval(queueRefreshInterval);
    await onTerminalExit();
    resolve();

  });
  const renderer = termSummary.render(terminal);

  queueRefreshInterval = _refreshQueue(redisDbQueue, jobDefinition, renderer);

  renderer.summary.updateMessage('Running');

  executeWithProgressReporting(redisDbResult, redisDbQueue, jobDefinition, renderer);

});

module.exports = {
  start,
};
