const shell = require('shelljs');

const stop = async () => {

  shell.exec('docker-compose -f ./lib/start/docker-compose.yml down');

};

module.exports = stop;
