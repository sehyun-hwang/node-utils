import express from 'express';
import MessageValidator from 'sns-validator';

import router from './Router.js';
const validator = new MessageValidator();


export function io_of(io) {
    console.log('utils ioof');
    io.on('connection', socket => {
        const { id, handshake: { headers } } = socket;
        console.log('Socket.IO connected', id, headers['user-agent']);
        socket.on('Log', Log);
    });
}

function Log(...data) {
    console.log('Remote Log:', ...data);
    router.io.emit('Log', ...data);
}

router.get('/log', (req, res) => res.status(405).send());

router.post('/log',
    ({ headers }, res, next) => {
        if (headers['x-amz-sns-message-type'] === 'Notification')
            headers['content-type'] = 'application/json';
        next();
    },

    express.json(),
    express.text(),
    ({ body, headers }, res) => {
        Log(body);

        headers['content-type'] === 'application/json' ? res.json(body) : res.send(body);

        body.SigningCertURL &&
            validator.validate(body, error => error && console.log(error));
    });
