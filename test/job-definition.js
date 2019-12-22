module.exports = {
  start: async () => false,
  url: 'http://localhost:3001',
  config: {
    name: 'test-job',
    concurrencyLimit: 1,
    depthLimit: 1,
  },
  connection: {
    redis: {
      port: 6379,
      host: 'localhost',
    },
    chrome: {
      browserWSEndpoint: 'ws://localhost:3000',
    },
  },
};
