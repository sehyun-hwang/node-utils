import { inspect } from 'util';

import _ from 'lodash';
import jsrender from 'jsrender';

import { PathParser } from './index.js';


const processLayer = layer => {
    const { stack } = layer?.handle || {};
    if (!stack)
        return layer;

    const base = (layer.base || '') + (layer.regexp?.toString().replace('/^', '').replace('?(?=\\/|$)/i', '').replace(/\\\//g, '/') || '');
    stack.forEach(x => Object.assign(x, { base }));
    return stack.map(processLayer);
};


function getRoutes(app) {

    const routes = _({ layer: { handle: app._router } })
        .map(processLayer)
        .flattenDeep()
        .filter('route.path')
        .groupBy(x => x.base + x.route.path)
        .mapValues(x => x.map(x => Object.keys(x.route.methods).toString().toUpperCase())
            //
        )
        .value();
    delete routes.undefined;
    console.log('routes', routes);
    return routes;
}


export default function (app) {
    let routes;
    //routes = getRoutes(app);
    //throw new Error();
    try {
        routes = getRoutes(app);
        app.get('/routes', (req, res) => res.json(routes));
    }
    catch (error) {
        console.log(error);
    }

    app
        .engine('html', jsrender.__express)
        .set('view engine', 'html')
        .set('views',
            PathParser(
                import.meta.url).dir + '/Templates')

        .use((req, res) => {
            res.status(404);

            const obj = {
                error: '404 Not Found',
                routes,
                req: inspect(req, {
                    depth: 1,
                })
            };

            if (req.accepts('html'))
                res.render('404', obj);
            else if (req.accepts('json'))
                res.json(obj);
            else
                res.type('txt').send(JSON.stringify(routes));
        });
}
