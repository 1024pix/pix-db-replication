import { $ } from 'bun';

console.log('hello world');

type ModuleParam = {name: string; path: string, url: string}


class Module {
  public name: string;
  public path: string;
  public url: string;

  constructor({name, path, url}: {name: string; path: string, url: string}) {
    this.name = name;
    this.path = path;
    this.url = url;
  }
}

const headers = new Headers();
const request = new Request('https://api.github.com/repos/1024pix/pix/contents/api/src/devcomp/infrastructure/datasources/learning-content/modules');

const modulesBody = await fetch(request);
const modules: Module[] = (await modulesBody.json()).map(item => new Module(item));

for(const module of modules) {
  const moduleContent = await (await fetch(module.url)).json();
  const path = import.meta.dir + `/modules/${module.name}`;
  Bun.write(path, JSON.stringify(moduleContent));
}

console.log(modules);



