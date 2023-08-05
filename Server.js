import { IsMain, MyURL } from './utils/index.js';
import { Run } from './utils/Express.js';

import router from './Router.js';
import './Cloud9Users.js';
import { io_of } from './Log.js';
import './Proxy.js';
import './ps.js';


router.get("/", (req, res) => res.redirect(MyURL.www + "node/"));
router.use("/_*", (req, res, next) => {
    const { app, originalUrl } = req;
    if (originalUrl.startsWith('/_/') || originalUrl === 'livereload')
        return next();

    req.originalUrl = '/_' + originalUrl;
    req.url = '/_' + originalUrl;
    app.handle(req, res);
});


export { router, io_of };

IsMain(import.meta.url) && Run({router, io_of}, 8088);