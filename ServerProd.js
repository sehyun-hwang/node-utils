import shell from 'shelljs';

import { Template as Express } from "utils/Express";

const ROOT_APP = 'Server';

const FileName = 'Server.js';
const Apps = shell.ls("./*/" + FileName).map(x => x.slice(0, -3).split("/")[1]);
Apps.push('');

Object.freeze(Apps);
console.log('Folders with', FileName, ':', Apps);

//throw new Error('Abort')


const Listen = http => new Promise(resolve => http.listen(process.env.PORT || 8080, '0.0.0.0', resolve))
    .then(() => console.log('Listening on:', http.address()));


const Run = ({ app, io, http }, Commands) => Promise.all(Apps.map(App => import(['.', App, FileName].join('/'))


        .then(Module => {
            console.log(App, "is starting");
            console.log('Exports', ...Object.keys(Module));
            if (App === ROOT_APP)
                App = '';

            const io_of = App ? io.of(App) : io;
            Module.io_of && Module.io_of(io_of);

            let { router } = Module;
            if (router) {
                //if (Router.handle !== router.handle)
                if (!router.toString().includes('req, res, next'))
                    router = router(io_of);
                router.io = io_of;
                app.use('/' + App, router);
            }
            if (Commands)
                Commands[App || ROOT_APP] = Module.command || Function.prototype;
            console.log(App, "is running");
        })
        .catch(console.log)))

    .then(Listen.bind(undefined, http))
    .catch(console.log);


Run(Express());
