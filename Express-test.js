import { it } from 'node:test';
import assert from 'node:assert/strict';

import express from 'express';

import { Run } from './utils/Express.js';

const emptyModule = {
  router: express.Router(),
};

it('express with empty router only', async () => {
  const { http } = await Run(emptyModule, 0);

  const defaultFetch = fetch('http://localhost:' + http.address().port);
  const p1 = it('fetch promise resolved', () => defaultFetch);

  const p2 = it('cors header is falsy', () => defaultFetch
    .then(({ headers }) => assert.ok(!headers.get('Access-Control-Allow-Origin')))
  );

  const Origin = 'https://example.com';
  const originedFetch = fetch('http://localhost:' + http.address().port, {
    headers: {
      Origin,
    },
  });
  const p3 = it('cors header is *', () => originedFetch
    .then(({ headers }) => assert.equal(headers.get('Access-Control-Allow-Origin'), Origin))
  );

  const forwaredFetch = fetch('http://localhost:' + http.address().port, {
    headers: {
      forwarded: 'for=192.0.2.43, for=198.51.100.17',
    },
  });
  const p4 = it('cors header is missing when forwarded', () => forwaredFetch
    .then(({ headers }) => assert.ok(!headers.get('Access-Control-Allow-Origin')))
  );

  await Promise.allSettled([p1, p2, p3, p4]);
});


it('express with custom CORS configuration', async () => {
  const { http, app } = await Run(emptyModule, 0);
  const origin = 'https://example.com';
  app.set('cors', {
    origin,
  })

  return it('should always return cors header set in express app', () => fetch('http://localhost:' + http.address().port)
    .then(({ headers }) => assert.equal(headers.get('Access-Control-Allow-Origin'), origin)));
});
