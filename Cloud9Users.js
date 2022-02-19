import { exec } from "child_process";
import { totalmem, freemem, userInfo } from "os";

import { IsMain } from 'utils';

let Last, MemoryInterval;


const main = () => new Promise((resolve, reject) => exec("pgrep -af vfs-worker", (error, stdout, stderr) => error && error.code !== 1 ?
        reject(JSON.stringify({ error, stderr })) : resolve(stdout)))
    .then(stdout => {
        let cur = stdout.toString().split("\n");
        cur.pop();
        //console.log(cur);

        cur = cur.map(x => {
            const raw = x.split(' ')[2];
            const brackets = (raw.match(/{/g) || []).length - (raw.match(/}/g) || []).length;
            const quotes = (raw.match(/"/) || []).length;
            return raw + (quotes % 2 ? '"' : '') + '}'.repeat(brackets);
        });
        cur = cur.map(x => JSON.parse(x));
        cur = cur.map(x => x.defaultEnv.C9_USER);
        cur = new Set(cur);
        const { size } = cur;

        if (size === Last) {
            clearInterval(MemoryInterval);
            MemoryInterval = undefined;
            return;
        }

        console.log(new Date().toLocaleTimeString(), "Cloud 9 Users:", cur);
        Last = size;
        if (!MemoryInterval)
            MemoryInterval = setInterval(() => console.log('Free memory:', 100 * freemem() / totalmem()), 1000);
    });


IsMain(
        import.meta.url) ? main() :
    (userInfo().uid && setInterval(main, 10000));
