import { execa } from 'execa';

async function execStdOut(cmd, args) {
  const { stdout } = await execa({ stderr: 'inherit' }) `${cmd} ${args}`;
  return stdout;
}

function execShell(cmdline) {
  return execa({ stdio: 'inherit', shell: true }) `${cmdline}`;
}

function exec(cmd, args) {
  return execa({ stdio: 'inherit' }) `${cmd} ${args}`;
}

export {
  execStdOut,
  execShell,
  exec,
};
