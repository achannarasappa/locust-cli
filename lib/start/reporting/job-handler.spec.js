const { assert } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const { error: { BrowserError } } = require('@achannarasappa/locust');

// const termQueue = require('../term/summary/queue');
// const termSummary = require('../term/summary');
// const term = require('../term');
const { handleJobError } = require('./job-handler');

describe('job-handler', () => {

  describe('handleJobResult', () => {

    it('updates the status to done');

    it('pushes the result to redis');

    context('when a stop condition was met', () => {

      it('updates the status line to the stop condition description');

      // TODO: Check if this is necessary
      it('stops the queue');

    });

    context('when a queue constraint was met', () => {

      it('logs the constraint that was met');

    });

  });
  describe('handleJobError', () => {

    let updateSpy;
    let renderer;

    before(() => {

      updateSpy = sinon.spy();
      renderer = {
        job: {
          update: updateSpy,
        },
      };

    });

    afterEach(() => {

      updateSpy.resetHistory();

    });

    it('updates the job status to failed', () => {

      handleJobError(renderer)(new Error('test'));
      assert.ok(updateSpy.calledOnce);
      assert.ok(updateSpy.calledWithMatch(sinon.match.has('indicator', 'fail')));

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
        assert.ok(updateSpy.calledOnce);
        assert.ok(updateSpy.calledWithMatch(sinon.match.has('indicator', 'warn')));

      });

    });

  });

});

