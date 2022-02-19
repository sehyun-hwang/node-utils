import path from 'path';
import { promises as fs } from "fs";
import { tmpdir } from 'os';

import shell from "shelljs";

const PREFIX = tmpdir + '/express-';
const makeTempDir = prefix => fs.mkdtemp(PREFIX + prefix + '-');
//shell.rm(tmpdir + '/node_modules')
shell.ln('-sf', process.cwd() + '/node_modules', tmpdir + '/node_modules');

const cleanup = new Promise(resolve => setImmediate(() => {
    const path = PREFIX + '*';
    console.log('Removing temporary src directory', path);
    shell.rm('-rf', path);
    resolve();
}));


export const Import = exported =>
    import("./../" + exported);


export const ImportFresh = async exported => {
    await cleanup;

    const app = path.dirname(exported);
    const appRoot = path.resolve(app);
    const newAppRoot = (await makeTempDir(app)) + '/' + app;
    await fs.symlink(appRoot, newAppRoot);

    const newExport = newAppRoot + '/' + path.basename(exported);
    console.log("Freshly importing", newExport);
    return import(newExport);
};
