const R = require('ramda');
const { execute } = require('@achannarasappa/locust');
const jobHandler = require('./job-handler');

const _instrumentJobDefinition = (_execute, jobDefinition, renderer) => {

  const instrumentedJobDefinition = R.mergeAll([
    {},
    jobDefinition,
    {
      start: () => {

        _execute();

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
) => {

  const _execute = () => execute(
    _instrumentJobDefinition(
      _execute,
      jobDefinition,
      renderer,
    ),
  )
    .then(jobHandler.handleJobResult(renderer, redisDbResult, redisDbQueue, jobDefinition))
    .catch(jobHandler.handleJobError(renderer));

  return _execute();

};

module.exports = executeWithProgressReporting;

