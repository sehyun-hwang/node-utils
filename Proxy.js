import router from './Router.js';
import got from 'got';

import ToBuffer from 'stream-to-array';

const Cache = new Map();

router.get('/proxy', ({ query: { t, nocache }, }, res) => {
    console.log(t);
    if (!t)
        return res.status(400).json({
            error: 'Missing "t" in query parameter'
        });

    const Handler = error => {
        const { code, message } = error;
        console.log(code, message);
        const matched = /[0-9]{3}/.exec(message);

        res.headersSent || res.status(
            ('ETIMEDOUT ENOTFOUND ECONNRESET'.includes(code) && 502) ||
            (matched && matched[0]) ||
            500).send(error);
    };
    try {
        new URL(t);
    }
    catch (error) {
        Handler(error);
        return;
    }


    if (Cache.has(t))
        return res.send(Cache.get(t));

    const stream = got.stream(t, {
            timeout: { request: 3000 },
        })

        .on('error', Handler)
        .on('response', () => {
            if (nocache !== undefined)
                return;

            ToBuffer(stream).then(buffer => {
                    console.log('Setting buffer', t, buffer);
                    Cache.set(t, buffer);
                })
                .catch(console.log);
        })

        .pipe(res);
});
