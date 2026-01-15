import { execa } from 'execa';

const transform = function * (line) {

  line = sanitizeCredentials(line);

  yield line;

};

function sanitizeCredentials(text) {
  const db_credentials_regex = /postgres:\/\/([\w]+:[\w]+)/gi;
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

async function exec(cmd, args) {
  try {
    const { stdout } = await execa({ stdout: [transform] }) `${cmd} ${args}`;
    return stdout;
  } catch (error) {
    throw new Error(sanitizeCredentials(error.shortMessage));
  }
}

export {
  execStdOut,
  execShell,
  exec,
  transform,
};
