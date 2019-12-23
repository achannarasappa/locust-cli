const { assert } = require('chai');
const sinon = require('sinon');
const Redis = require('ioredis');
const shell = require('shelljs');
const R = require('ramda');
const fs = require('fs');
const start = require('./index');
const reporting = require('./reporting');

const buildResults = (domain = 'test.com', length = 10) => Array(length).fill(0).map((v, i) => ({
  data: {
    test_key: 'text_value',
  },
  links: [`http://${domain}/${i}`],
}));

describe('cli', () => {

  describe('start', () => {

    let redisDbQueue;
    let redisDbResult;
    let reportingStub;
    let fsStub;

    before(async () => {

      // eslint-disable-next-line global-require, import/no-dynamic-require
      const jobDefinition = require(`${process.cwd()}/test/job-definition.js`);
      redisDbQueue = await new Redis(jobDefinition.connection.redis);
      redisDbResult = await new Redis(R.mergeRight(jobDefinition.connection.redis, {
        db: 1,
      }));

    });

    beforeEach(() => {

      reportingStub = sinon
        .stub(reporting, 'start')
        .resolves(null);
      fsStub = sinon
        .stub(fs, 'writeFileSync')
        .returns(null);

    });

    afterEach(() => {

      reportingStub.restore();
      fsStub.restore();

    });

    it('starts a job', async () => {

      await start('./test/job-definition.js');
      assert.ok(reportingStub.calledOnce);

    });

    it('removes existing results and queue state', async () => {

      const preExistingResults = buildResults('existing.com').map(JSON.stringify);

      await redisDbResult.lpush('results', ...preExistingResults);

      await start('./test/job-definition.js');

      assert.equal(await redisDbResult.llen('results'), 0);
      assert.deepEqual(await redisDbQueue.hkeys('sc:test-job:state'), []);

    });

    it('writes results to a file', async () => {

      const newResults = buildResults('new.com', 3);
      const newResultsJson = newResults.map(JSON.stringify);

      reportingStub.restore();
      reportingStub = sinon
        .stub(reporting, 'start')
        .callsFake(() => redisDbResult.lpush('results', ...newResultsJson));
      fsStub.restore();
      fsStub = sinon
        .stub(fs, 'writeFileSync');

      await start('./test/job-definition.js');

      assert.ok(fsStub.calledOnce);
      assert.ok(fsStub.calledWithMatch(sinon.match(/\.json$/), JSON.stringify(newResults.reverse())));

    });

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

    context('when an error is thrown', () => {

      it('writes the error to a log file');

    });

  });

});
