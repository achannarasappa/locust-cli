// const { assert } = require('chai');
// const sinon = require('sinon');
// const termQueue = require('../term/summary/queue');
// const termSummary = require('../term/summary');
// const term = require('../term');
// const { start } = require('./reporting');

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

    it('it updates the job status to failed');

    it('writes the error to the log');

    context('and the error is a BrowserError', () => {

      it('updates the job status to ');

    });

  });

});

