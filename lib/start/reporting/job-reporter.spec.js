const { assert } = require('chai');
const sinon = require('sinon');
const R = require('ramda');
// const termSummary = require('../term/summary');
// const term = require('../term');
const locust = require('@achannarasappa/locust');
const jobDefinition = require('../../../test/job-definition');
const executeWithProgressReporting = require('./job-reporter');
const jobHandler = require('./job-handler');

describe('job-reporter', () => {

  describe('executeWithProgressReporting', () => {

    let handleJobResultStub;
    let handleJobErrorStub;
    let updateJobSpy;
    let addJobSpy;
    let renderer;
    let executeStub;

    before(() => {

      const browser = {
        newPage: () => Promise.resolve({
          goto: () => Promise.resolve({
            ok: () => Promise.resolve(true),
            status: () => Promise.resolve(200),
            statusText: () => Promise.resolve(''),
            headers: () => Promise.resolve([]),
            url: () => Promise.resolve(''),
            text: () => Promise.resolve(''),
          }),
          $$eval: () => Promise.resolve([]),
          $eval: () => Promise.resolve(''),
          cookies: () => Promise.resolve([]),
        }),
      };
      handleJobResultStub = sinon.stub(jobHandler, 'handleJobResult');
      handleJobErrorStub = sinon.stub(jobHandler, 'handleJobError');
      updateJobSpy = sinon.spy();
      addJobSpy = sinon.spy();
      renderer = {
        job: {
          update: updateJobSpy,
          add: addJobSpy,
        },
      };
      executeStub = sinon.stub(locust, 'execute').callsFake(async (runJobDefinition) => {

        const snapshot = {
          state: {
            firstRun: 1,
          },
        };
        const jobData = {
          url: runJobDefinition.url,
        };
        await locust.runJob(browser, runJobDefinition, jobData, snapshot);

        if (runJobDefinition.after)
          await runJobDefinition.after({
            response: {
              url: 'https://locust.dev',
            },
          });

      });

    });

    after(() => {

      sinon.restore();

    });

    afterEach(() => {

      addJobSpy.resetHistory();
      updateJobSpy.resetHistory();

    });

    it('starts a locust job run', async () => {

      await executeWithProgressReporting(sinon.fake(), jobDefinition, renderer);

      assert.ok(executeStub.calledOnce);

    });

    it('updates the job status to in progress', async () => {

      await executeWithProgressReporting(sinon.fake(), jobDefinition, renderer);

      assert.ok(addJobSpy.calledOnce);
      assert.ok(addJobSpy.calledWithMatch(sinon.match.has('status', 'Starting')));

    });

    context('when a hook is not defined', () => {

      it('does not update the status to indicate that hook is being run', async () => {

        const jobDefinitionTest = R.omit([
          'beforeAll',
          'before',
          'extract',
          'after',
        ], jobDefinition);

        await executeWithProgressReporting(sinon.fake(), jobDefinitionTest, renderer);

        assert.ok(addJobSpy.calledOnce);
        assert.ok(updateJobSpy.notCalled);

      });

    });

    context('when a beforeAll hook is defined', () => {

      context('and the hook is run', () => {

        it('updates the status line to indicate the hook being run', async () => {

          const hookSpy = sinon.spy();
          const jobDefinitionTest = R.assoc('beforeAll', hookSpy, jobDefinition);

          await executeWithProgressReporting(sinon.fake(), jobDefinitionTest, renderer);

          assert.ok(hookSpy.calledOnce);
          assert.ok(updateJobSpy.calledOnce);
          assert.ok(updateJobSpy.calledWithMatch(sinon.match.has('description', 'beforeAll hook')));

        });

      });

    });

    context('when a before hook is defined', () => {

      context('and the hook is run', () => {

        it('updates the status line to indicate the hook being run', async () => {

          const hookSpy = sinon.spy();
          const jobDefinitionTest = R.assoc('before', hookSpy, jobDefinition);

          await executeWithProgressReporting(sinon.fake(), jobDefinitionTest, renderer);

          assert.ok(hookSpy.calledOnce);
          assert.ok(updateJobSpy.calledOnce);
          assert.ok(updateJobSpy.calledWithMatch(sinon.match.has('description', 'before hook')));

        });

      });

    });

    context('when a extract hook is defined', () => {

      context('and the hook is run', () => {

        it('updates the status line to indicate the hook being run', async () => {

          const hookSpy = sinon.spy();
          const jobDefinitionTest = R.assoc('extract', hookSpy, jobDefinition);

          await executeWithProgressReporting(sinon.fake(), jobDefinitionTest, renderer);

          assert.ok(hookSpy.calledOnce);
          assert.ok(updateJobSpy.calledOnce);
          assert.ok(updateJobSpy.calledWithMatch(sinon.match.has('description', 'extract hook')));

        });

      });

    });

    context('when an after hook is defined', () => {

      context('and the hook is run', () => {

        it('updates the status line to indicate the hook being run', async () => {

          const hookSpy = sinon.spy();
          const jobDefinitionTest = R.assoc('after', hookSpy, jobDefinition);

          await executeWithProgressReporting(sinon.fake(), jobDefinitionTest, renderer);

          assert.ok(hookSpy.calledOnce);
          assert.ok(updateJobSpy.calledOnce);
          assert.ok(updateJobSpy.calledWithMatch(sinon.match.has('description', 'after hook')));

        });

      });

    });

  });

});

