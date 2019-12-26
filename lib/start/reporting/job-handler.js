const fs = require('fs');
const { error: { QueueEndError, QueueError } } = require('@achannarasappa/locust');

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

  fs.appendFileSync('log.txt', [
    '\n',
    e.name,
    e.url,
    e.message,
    e.stack,
  ].join('\n'));

};

const handleJobResult = (renderer, redisDbResult) => async (result) => {

  /* istanbul ignore next line */
  if (result instanceof QueueError)
    // TODO: Add some logging here
    return;

  if (result instanceof QueueEndError) {

    renderer.job.add({
      indicator: 'info',
      status: 'Stop',
      url: result.url,
      description: result.message,
    });
    renderer.summary.updateMessage('Done');

    return;

  }

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

