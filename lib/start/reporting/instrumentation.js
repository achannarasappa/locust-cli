const R = require('ramda');
const { appendFileSync } = require('fs');
const { queue, execute, error: { QueueEndError, QueueError } } = require('@achannarasappa/locust');

const _handleJobError = (renderer) => (e) => {

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

const _handleJobResult = (
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

const _instrumentJobDefinition = (redisDbResult, redisDbQueue, jobDefinition, renderer) => {

  const instrumentedJobDefinition = R.mergeAll([
    {},
    jobDefinition,
    {
      start: () => {

        // eslint-disable-next-line no-use-before-define
        executeWithProgressReporting(
          redisDbResult,
          redisDbQueue,
          instrumentedJobDefinition,
          renderer,
        );

      },
      beforeStart: (jobData) => {

        renderer.job.add({
          indicator: 'in_progress',
          status: 'Starting',
          url: jobData.url,
        });

      },
      beforeAll: (browser, snapshot, jobData) => {

        if (!jobDefinition.beforeAll)
          return;

        renderer.job.update({
          indicator: 'in_progress',
          status: 'Running',
          url: jobData.url,
          description: 'beforeAll hook',
        });

        return jobDefinition.beforeAll(browser, snapshot, jobData);

      },
      before: (page, snapshot, jobData) => {

        if (!jobDefinition.before)
          return;

        renderer.job.update({
          indicator: 'in_progress',
          status: 'Running',
          url: jobData.url,
          description: 'before hook',
        });
        return jobDefinition.before(page, snapshot, jobData);

      },
      extract: ($, browser, jobData) => {

        if (!jobDefinition.extract)
          return;

        renderer.job.update({
          indicator: 'in_progress',
          status: 'Running',
          url: jobData.url,
          description: 'extract hook',
        });
        return jobDefinition.extract($, browser, jobData);

      },
      after: (jobResult, snapshot, stopQueue) => {

        if (!jobDefinition.after)
          return;

        renderer.job.update({
          indicator: 'in_progress',
          status: 'Running',
          url: jobResult.response.url,
          description: 'after hook',
        });
        return jobDefinition.after(jobResult, snapshot, stopQueue);

      },
    },
  ]);

  return instrumentedJobDefinition;

};

const executeWithProgressReporting = async (
  redisDbResult,
  redisDbQueue,
  jobDefinition,
  renderer,
) => execute(
  _instrumentJobDefinition(
    redisDbResult,
    redisDbQueue,
    jobDefinition,
    renderer,
  ),
)
  .then(_handleJobResult(renderer, redisDbResult, redisDbQueue, jobDefinition))
  .catch(_handleJobError(renderer));

module.exports = executeWithProgressReporting;

