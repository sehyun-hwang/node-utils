import { parse, basename } from "path";
import { realpathSync } from 'fs';
import { hostname as Host } from 'os';
import { get as getRequest } from 'http';

const host = Host();
const _MyURL = ["www", "proxy", "nextlab", "iptime", "kbdlab", ];
console.log("URLs", _MyURL);
export const MyURL = new Proxy(_MyURL, {
    get(arr, Subdomain) {
        if (Subdomain === "localhost")
            return "localhost";
        if (!arr.includes(Subdomain))
            throw new Error(`Requested subdomain "${Subdomain}" does not exsist!`);

        const url = new URL("https://" + host);
        url.hostname = url.hostname.replace(/.+?\./, Subdomain + '.');
        return url;
    }
});


let mainFile = realpathSync(process.argv[1]);
if (!mainFile.endsWith('.js'))
    mainFile += '/index.js';

export const PathParser = url => {
    if (url instanceof Error)
        new Error("Legacy interface", url);

    const { pathname } = new URL(url);
    const parsed = parse(pathname);

    const App = basename(parsed.dir),
        IsMain = pathname === mainFile,
        Prefix = (IsMain ? "." : App) + "/";

    return Object.assign(parsed, {
        App,
        IsMain,
        Prefix
    });
};


export const IsMain = url => PathParser(url).IsMain;


export const ExternalIP = new Promise(resolve => getRequest('http://checkip.amazonaws.com', res => res.once('data', resolve)))
    .then(data => {
        const IP = data.toString().trim();
        console.log(IP);
        return IP;
    });


setImmediate(() => {
    const parsed = PathParser(
        import.meta.url);

    if (parsed.IsMain) {
        console.log('Test succeeded');
        console.log(parsed);
    }
    //else
    //    throw new Error('Test failed')
});
