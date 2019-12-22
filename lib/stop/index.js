/* istanbul ignore file */
const shell = require('shelljs');

const stop = () => {

  shell.exec('docker-compose -f ./lib/start/docker-compose.yml down');

};

module.exports = stop;
