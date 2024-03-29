const { execShell, exec } = require('./exec');

// dbclient-fetch assumes $HOME/bin is in the PATH
async function setupPath() {
  await execShell('mkdir -p "$HOME/bin"');
  // eslint-disable-next-line no-process-env
  process.env.PATH = process.env.HOME + '/bin' + ':' + process.env.PATH;
}

function installPostgresClient(configuration) {
  return exec('dbclient-fetcher', [ 'pgsql', configuration.PG_CLIENT_VERSION ]);
}

async function pgclientSetup(configuration) {
  // eslint-disable-next-line no-process-env
  if (process.env.NODE_ENV === 'production') {
    await setupPath();
    await installPostgresClient(configuration);
  }
}

module.exports = {
  pgclientSetup,
};
