const app = require('./server');
const env = require('./configs/env');

app.listen(env.porta_http, () => {
    console.log('HTTP server listening on', env.porta_http);
  });