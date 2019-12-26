const { assert } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const { error: { BrowserError, QueueEndError } } = require('@achannarasappa/locust');
const { handleJobError, handleJobResult } = require('./job-handler');

describe('job-handler', () => {

  let updateJobSpy;
  let addJobSpy;
  let updateMessageSpy;
  let renderer;

  before(() => {

    updateJobSpy = sinon.spy();
    addJobSpy = sinon.spy();
    updateMessageSpy = sinon.spy();
    renderer = {
      job: {
        update: updateJobSpy,
        add: addJobSpy,
      },
      summary: {
        updateMessage: updateMessageSpy,
      },
    };

  });

  afterEach(() => {

    updateJobSpy.resetHistory();
    addJobSpy.resetHistory();

  });

  describe('handleJobResult', () => {

    let rpushSpy;
    let redisDbResult;
    const successResult = {
      response: {
        url: 'http://locust.dev',
      },
    };

    before(() => {

      rpushSpy = sinon.spy();
      redisDbResult = {
        rpush: rpushSpy,
      };

    });

    afterEach(() => {

      rpushSpy.resetHistory();

    });

    it('updates the status to done', async () => {

      await handleJobResult(renderer, redisDbResult)(successResult);
      assert.ok(updateJobSpy.calledOnce);
      assert.ok(updateJobSpy.calledWithMatch(sinon.match.has('indicator', 'success')));

    });

    it('pushes the result to redis', async () => {

      await handleJobResult(renderer, redisDbResult)(successResult);
      assert.ok(rpushSpy.calledOnce);
      assert.ok(rpushSpy.calledWithMatch(sinon.match.string, sinon.match.string));

    });

    context('when a stop condition was met', () => {

      it('adds the job that triggered the stop condition', async () => {

        const input = new QueueEndError('queue ended', 'http://locust.dev', 'test-queue');
        await handleJobResult(renderer, redisDbResult)(input);

        assert.ok(addJobSpy.calledOnce);
        assert.ok(addJobSpy.calledWithMatch(sinon.match.has('indicator', 'info')));

      });

    });

    context('when a queue constraint was met', () => {

      it('logs the constraint that was met');

    });

  });
  describe('handleJobError', () => {

    it('updates the job status to failed', () => {

      handleJobError(renderer)(new Error('test'));
      assert.ok(updateJobSpy.calledOnce);
      assert.ok(updateJobSpy.calledWithMatch(sinon.match.has('indicator', 'fail')));

    });

    it('writes the error to the log', () => {

      const fsStub = sinon.stub(fs, 'appendFileSync');

      handleJobError(renderer)(new Error('test'));

      assert.ok(fsStub.calledOnce);

      fsStub.restore();

    });

    context('and the error is a BrowserError', () => {

      it('updates the job status to warn', () => {

        const input = new BrowserError({ statusText: 'browser error', url: 'http://locust.dev' });

        handleJobError(renderer)(input);
        assert.ok(updateJobSpy.calledOnce);
        assert.ok(updateJobSpy.calledWithMatch(sinon.match.has('indicator', 'warn')));

      });

    });

  });

});

