const locust = require('@achannarasappa/locust');
const termQueue = require('../../term/summary/queue');
const termSummary = require('../../term/summary');
const term = require('../../term');
const executeWithProgressReporting = require('./job-reporter');

const _waitForTerminalExit = () => (
  (new Promise((resolve) => setTimeout(resolve, 5000)))
    .then(_waitForTerminalExit)
);

const _refreshQueue = (redis, jobDefinition, renderer) => setInterval(async () => {

  const snapshot = await locust.queue.getSnapshot(redis, jobDefinition.config.name);
  termQueue.updateQueue(renderer, snapshot);

}, 1000);

const start = async (redisDbQueue, redisDbResult, jobDefinition, onTerminalExit) => {

  let queueRefreshInterval;
  const terminal = term.start(async () => {

    clearInterval(queueRefreshInterval);
    await onTerminalExit();

  });
  const renderer = termSummary.render(terminal);

  queueRefreshInterval = _refreshQueue(redisDbQueue, jobDefinition, renderer);

  renderer.summary.updateMessage('Starting');

  executeWithProgressReporting(redisDbResult, redisDbQueue, jobDefinition, renderer);

  await _waitForTerminalExit();

};

module.exports = {
  start,
};