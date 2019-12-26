// const { assert } = require('chai');
// const sinon = require('sinon');
// const termQueue = require('../term/summary/queue');
// const termSummary = require('../term/summary');
// const term = require('../term');
// const { start } = require('./reporting');

describe('instrumentation', () => {

  describe('executeWithProgressReporting', () => {

    it('starts a locust job run');

    it('updates the job status to in progress');

    context('and a beforeAll is defined', () => {

      context('and the beforeAll hook is run', () => {

        it('updates the status line to indicate the hook being run');

      });

    });

    context('and a before is defined', () => {

      context('and the before hook is run', () => {

        it('updates the status line to indicate the hook being run');

      });

    });

    context('and a extract is defined', () => {

      context('and the extract hook is run', () => {

        it('updates the status line to indicate the hook being run');

      });

    });

    context('and a after is defined', () => {

      context('and the after hook is run', () => {

        it('updates the status line to indicate the hook being run');

      });

    });

    context('and the job finishes', () => {

      it('updates the status to done');

      it('pushes the result to redis');

      context('and a stop condition was met', () => {

        it('updates the status line to the stop condition description');

        // TODO: Check if this is necessary
        it('stops the queue');

      });

      context('and a queue constraint was met', () => {

        it('logs the constraint that was met');

      });

    });

    context('and an error is thrown', () => {

      it('it updates the job status to failed');

      it('writes the error to the log');

      context('and the error is a BrowserError', () => {

        it('updates the job status to ');

      });

    });

  });

});

