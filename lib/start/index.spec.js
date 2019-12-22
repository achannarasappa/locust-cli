const { assert } = require('chai');
const sinon = require('sinon');
// const puppeteer = require('puppeteer');
// const locust = require('@achannarasappa/locust');
const shell = require('shelljs');
const start = require('./index');

describe('cli', () => {

  describe('start', () => {

    it('starts a job');

    it('overwrites the start hook with a shell command');

    it('overwrites the connection details with local redis and chrome connection details');

    context('when the boostrap option is set', () => {

      let shellWhichStub = sinon.stub();
      let shellExecStub = sinon.stub();
      let consoleStub = sinon.stub();

      beforeEach(() => {

        consoleStub = sinon
          .stub(console, 'log')
          .returns(false);
        shellWhichStub = sinon
          .stub(shell, 'which')
          .returns(true);
        shellExecStub = sinon
          .stub(shell, 'exec')
          .returns({
            code: 0,
          });

      });

      afterEach(() => {

        consoleStub.restore();
        shellWhichStub.restore();
        shellExecStub.restore();

      });

      it('starts dependencies defined in the docker-compose file', async () => {

        await start('./test/job-definition.js', true);
        assert.ok(shellExecStub.calledWithMatch(sinon.match(/^docker-compose (.*) up/)));
        assert.ok(consoleStub.calledTwice);
        assert.ok(consoleStub.calledWithMatch(sinon.match(/success/i)));

      });

      context('when docker is not installed', () => {

        it('prints a warning to the console', async () => {

          shellWhichStub.restore();
          shellWhichStub = sinon
            .stub(shell, 'which')
            .onCall(0).returns(false)
            .returns(true);

          await start('./test/job-definition.js', true);
          assert.ok(shellExecStub.notCalled);
          assert.ok(consoleStub.calledTwice);
          assert.ok(consoleStub.calledWithMatch(sinon.match(/missing/)));

        });

      });

      context('when docker-compose is not installed', () => {

        it('prints a warning to the console', async () => {

          shellWhichStub.restore();
          shellWhichStub = sinon
            .stub(shell, 'which')
            .onCall(0).returns(true)
            .onCall(1)
            .returns(false)
            .returns(true);

          await start('./test/job-definition.js', true);
          assert.ok(shellExecStub.notCalled);
          assert.ok(consoleStub.calledTwice);
          assert.ok(consoleStub.calledWithMatch(sinon.match(/missing/)));

        });

      });

      context('when docker-compose has trouble starting services', () => {

        it('prints a warning to the console', async () => {

          shellExecStub.restore();
          shellExecStub = sinon
            .stub(shell, 'exec')
            .returns({
              code: 1,
            });

          await start('./test/job-definition.js', true);
          assert.ok(shellExecStub.calledOnce);
          assert.ok(consoleStub.calledTwice);
          assert.ok(consoleStub.calledWithMatch(sinon.match(/failed/i)));

        });

      });

    });

  });

});
