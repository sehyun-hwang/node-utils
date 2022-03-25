import { networkInterfaces } from 'os';
import { Server } from 'http';
import { resolve } from 'path';

import debug from 'debug';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { Server as IO } from 'socket.io';

import { IsMain } from "utils";
import Code404 from './404.js';

debug.enable('express:router:layer');
const localAddresses = Object.values(networkInterfaces()).flat().filter(({ family, internal }) => family === 'IPv4')
    .map(({ address }) => address);
console.log(localAddresses);


const MorganOptions = {
    skip: (req) => {
        const { url, hostname, } = req;
        //console.log(req.headers['x-real-ip'], req.headers['referer']);
        //return localAddresses.includes(req._remoteAddress);
        return url === '/'
    }
};
morgan.token('date', () => new Date().toLocaleTimeString());
morgan.token('type', ({ headers }) => headers['content-type']);


export function Template() {
    const app = express();
    const http = Server(app);
    const io = new IO(http);

    app
        .use(morgan('combined', MorganOptions))
        //.use(morgan(':type', MorganOptions))

        .use(cors(({ headers }, callback) => callback(null, { origin: !('Forwarded' in headers) })))

        .options('*', (req, res) => res.writeHead(204, {
            'Access-Control-Allow-Methods': '*',
        }).end());

    http.on('listening', () => Code404(app));

    io.use((socket, next) => {
        console.log("Socket.IO connection from", socket.handshake.url);
        return next();
    });

    const Return = { app, http, io };
    return {
        ...Return,
        _app: app,
        _http: http,
        _io: io
    };
}


export function Run(Module, port = process.env.PORT) {
    const { app, http, io } = Template();

    Module.io_of && Module.io_of(io);
    if (Module.router) {
        const { App } = Module.router;
        console.log(App);
        app.set("io-" + App, io);
        app.use('/', Module.router);
    }

    http.listen(port, '0.0.0.0', () => console.log('Listening on:', http.address()));
}




IsMain(
    import.meta.url) && import(resolve(process.argv[2] || 'Server.js')).then(Run);
