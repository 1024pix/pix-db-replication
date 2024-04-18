import { execa } from 'execa';

async function execStdOut(cmd, args) {
  const { stdout } = await execa(cmd, args, { stderr: 'inherit' });
  return stdout;
}

function execShell(cmdline) {
  return execa(cmdline, { stdio: 'inherit', shell: true });
}

function exec(cmd, args) {
  return execa(cmd, args, { stdio: 'inherit' });
}

export {
  execStdOut,
  execShell,
  exec,
};
