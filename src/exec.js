import { execa } from 'execa';

const transform = function * (line) {

  line = sanitizeCredentials(line);

  yield line;

};

function sanitizeCredentials(text) {
  const db_credentials_regex = /postgres:\/\/([\w-]*:{0,1}[\w-]*)/gi;
  return text.replace(db_credentials_regex, 'postgres://*:*');
}

async function execStdOut(cmd, args) {
  try {
    const { stdout } = await execa({ stdout: [transform], stderr: 'inherit' })`${cmd} ${args}`;
    return stdout;
  } catch (error) {
    throw new Error(sanitizeCredentials(error.shortMessage));
  }
}

async function execShell(cmdline) {
  try {
    const { stdout } = await execa({ stdout: [transform], stderr: 'inherit', shell: true })`${cmdline}`;
    return stdout;
  } catch (error) {
    throw new Error(sanitizeCredentials(error.shortMessage));
  }
}

async function exec(cmd, args, timeout) {
  try {
    const { stdout } = await execa({ stdout: [transform], timeout }) `${cmd} ${args}`;
    return stdout;
  } catch (error) {
    if (error.timedOut) {
      throw new Error(sanitizeCredentials(`Command timed out after ${timeout / 1000}s: ${cmd} ${args}`));
    }
    throw new Error(sanitizeCredentials(error.shortMessage));
  }
}

export {
  execStdOut,
  execShell,
  exec,
  transform,
};
