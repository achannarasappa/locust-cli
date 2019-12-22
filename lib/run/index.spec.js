const { assert } = require('chai');
const sinon = require('sinon');
const puppeteer = require('puppeteer');
const locust = require('@achannarasappa/locust');
const run = require('./index');

describe('run', () => {

  it('runs a job definition and outputs the result', async () => {

    const expected = '\u001b[32mresponse: \u001b[39m\n  \u001b[32murl: \u001b[39mhttp://test.com/1\n\u001b[32mdata: \u001b[39m\n  \u001b[32mtest_key: \u001b[39mtext_value\n\u001b[32murl: \u001b[39m     http://test.com/1';
    const consoleSpy = sinon
      .stub(console, 'log')
      .returns(false);
    const puppeteerStub = sinon
      .stub(puppeteer, 'launch')
      .resolves({
        close: () => Promise.resolve(null),
      });
    const locustStub = sinon
      .stub(locust, 'runJob')
      .resolves({
        response: {
          url: 'http://test.com/1',
          body: 'test_body',
        },
        data: {
          test_key: 'text_value',
        },
        cookies: {
          'x-test': 'cookie',
        },
        links: ['http://test.com/1'],
      });

    await run('./test/job-definition.js');

    puppeteerStub.restore();
    locustStub.restore();
    consoleSpy.restore();

    assert.ok(locustStub.calledOnce);
    assert.ok(puppeteerStub.calledOnce);
    assert.deepEqual(expected, consoleSpy.getCall(1).args[0]);

  });

});
