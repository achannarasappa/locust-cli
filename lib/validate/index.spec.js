const { assert } = require('chai');
const sinon = require('sinon');
const locust = require('@achannarasappa/locust');
const validateJobFile = require('./index');

describe('validate', () => {

  it('validates a job file', async () => {

    const consoleSpy = sinon
      .spy(console, 'log');

    await validateJobFile('./test/job-definition.js');
    assert.ok(consoleSpy.calledOnce);
    assert.ok(consoleSpy.calledWithMatch('Job file is valid'));

    consoleSpy.restore();

  });

  context('when the job file is invalid', () => {

    it('prints a summary of the issues', async () => {

      const consoleSpy = sinon
        .spy(console, 'log');
      const validateStub = sinon
        .stub(locust, 'validate')
        .rejects({
          details: 'error',
        });

      await validateJobFile('./test/job-definition.js');
      assert.ok(consoleSpy.calledOnce);
      assert.ok(consoleSpy.calledWithMatch(sinon.match('error')));

      validateStub.restore();
      consoleSpy.restore();

    });

  });

});
