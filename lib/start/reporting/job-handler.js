const { appendFileSync } = require('fs');
const { queue, error: { QueueEndError, QueueError } } = require('@achannarasappa/locust');

const handleJobError = (renderer) => (e) => {

  if (e.name === 'BrowserError') {

    renderer.job.update({
      indicator: 'warn',
      status: 'Done',
      url: e.url,
      description: e.message,
    });
    return;

  }

  renderer.job.update({
    indicator: 'fail',
    status: 'Done',
    url: e.url,
    description: e.message,
  });

  appendFileSync('log.txt', [
    '\n',
    e.name,
    e.url,
    e.message,
    e.stack,
  ].join('\n'));

};

const handleJobResult = (
  renderer,
  redisDbResult,
  redisDbQueue,
  jobDefinition,
) => async (result) => {

  if (result instanceof QueueError)
    // TODO: Add some logging here
    return;

  const queueSnapshot = await queue.getSnapshot(redisDbQueue, jobDefinition.config.name);

  // TODO: case where QueueEndError is not returned at 0 in processing
  if (result instanceof QueueEndError
    && redisDbQueue.status === 'ready'
    && queueSnapshot.queue.processing.length === 0) {

    await (queue.stop(redisDbQueue, jobDefinition.config.name))();
    renderer.summary.updateMessage(result.message);
    return;

  }

  if (result instanceof QueueEndError)
    return;

  renderer.job.update({
    indicator: 'success',
    status: 'Done',
    url: result.response.url,
    description: '',
  });

  await redisDbResult.rpush('results', JSON.stringify(result));

  return result;

};

module.exports = {
  handleJobError,
  handleJobResult,
};

