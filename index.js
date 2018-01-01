const app = require('./src/app');
const models = require('./src/models');

models.conn.sync()
  .then(() => {
    const port = parseInt(process.env.API_PORT || '4000', 10);
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}/`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync: %s', err);
  });
