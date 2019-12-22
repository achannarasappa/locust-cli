const generateBeforeAll = (optionalHooks) => {

  if (!optionalHooks.includes('beforeAll'))
    return false;

  return [
    '  beforeAll: (browser, snapshot) => {',
    '  /**',
    '  * Add actions to be run once before the crawl starts',
    '  * https://locust.dev/docs/api#function-beforeall',
    '  */',
    '  },',
  ].join('\n');

};

const generateBefore = (optionalHooks) => {

  if (!optionalHooks.includes('before'))
    return false;

  return [
    '  before: (page, snapshot) => {',
    '  /**',
    '  * Add actions to be run before each job starts',
    '  * https://locust.dev/docs/api#function-before',
    '  */',
    '  },',
  ].join('\n');

};

const generateAfter = (optionalHooks) => {

  if (!optionalHooks.includes('after'))
    return false;

  return [
    '  after: (jobResult, snapshot, stopFn => {',
    '  /**',
    '  * Add actions to be run after each job completes',
    '  * https://locust.dev/docs/api#function-after',
    '  */',
    '  },',
  ].join('\n');

};

const generateExtract = (optionalHooks, extractFields) => {

  if (!optionalHooks.includes('extract'))
    return false;

  if (!extractFields.length)
    return [
      '  extract: async ($, browser) => ({',
      '  /**',
      '  * Function to extract data from the page while crawling',
      '  * https://locust.dev/docs/api#function-extract',
      '  */',
      '  }),',
    ].join('\n');

  return [
    '  extract: async ($, browser) => ({',
    extractFields.map(({ cssPath, label }) => `    '${label}': await $('${cssPath}'),`).join('\n'),
    '  }),',
  ].join('\n');

};

const generateStart = () => ([
  '  start: async () => {',
  '  /**',
  '  * Callback to initiate this job on the serverless provider',
  '  * https://locust.dev/docs/api#function-start',
  '  */',
  '  },',
].join('\n'));

const generateFilter = (filter, url) => {

  if (filter === 'yes')
    return [
      '  filter: {',
      '    allowList: [],',
      '    blockList: [],',
      '  },',
    ].join('\n');

  if (filter === 'yes_only_domain')
    return [
      '  filter: {',
      '    allowList: [',
      `      '${new URL(url).hostname}',`,
      '    ],',
      '    blockList: [],',
      '  },',
    ].join('\n');

  if (filter === 'yes_function')
    return [
      '  filter: (links) => {',
      '    return links;',
      '  },',
    ].join('\n');

  return false;

};

const generateRedisConnection = (redisConnection) => {

  if (redisConnection === 'none')
    return false;

  return [
    '    redis: {',
    '      port: 6379,',
    '      host: \'localhost\'',
    '    },',
  ].join('\n');

};

const generateBrowserConnection = (browserConnection) => {

  if (browserConnection === 'none')
    return '    chrome: {},';

  return [
    '    chrome: {',
    '      browserWSEndpoint: \'ws://localhost:3000\',',
    '    },',
  ].join('\n');

};

const template = ({
  name,
  url,
  optionalHooks,
  extractFields,
  concurrencyLimit,
  depth,
  filter,
  browserConnection,
  redisConnection,
}) => [
  'module.exports = {',
  generateBeforeAll(optionalHooks),
  generateBefore(optionalHooks),
  generateAfter(optionalHooks),
  generateExtract(optionalHooks, extractFields),
  generateStart(),
  `  url: '${url}',`,
  '  config: {',
  `    name: '${name}',`,
  `    concurrencyLimit: ${concurrencyLimit},`,
  `    depthLimit: ${depth},`,
  '    delay: 1000,',
  '  },',
  generateFilter(filter, url),
  '  connection: {',
  generateRedisConnection(redisConnection),
  generateBrowserConnection(browserConnection),
  '  }',
  '};',
].filter((v) => v).join('\n');

module.exports = template;
