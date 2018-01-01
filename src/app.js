const express = require('express');
const bodyParser = require('body-parser');

const models = require('./models');

const app = express();

// Handle loading a user once instead of within each route.
app.param('userId', (req, res, next, userId) => {
  const id = parseInt(userId, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  models.User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(404).end();
      }

      req.user = user;
      next();
    })
    .catch(next);
});

app.get('/users', (req, res, next) => {
  models.User.findAll()
    .then((users) => res.json(users))
    .catch(next);
});

app.get('/users/:userId(\\d+)', (req, res) => {
  res.json(req.user);
});

app.post('/users', bodyParser.json(), (req, res, next) => {
  let data = Object.assign({}, req.body);
  data.created = new Date();

  // Only allow users to set these fields (notably 'id' is excluded).
  const fields = [
    'created',
    'email',
    'forename',
    'surname',
  ];

  models.User.create(data, { fields })
    .then((user) => {
      res.status(201)
        .location(`/users/${user.id}`)
        .json(user);
    })
    .catch((err) => {
      for (const error of err.errors) {
        if (error.type === 'unique violation' && error.path === 'email') {
          return res.status(400).json({ error: 'Email address already exists' });
        }
      }

      next(err);
    });
});

app.put('/users/:userId(\\d+)', bodyParser.json(), (req, res, next) => {
  let user = req.user;

  for (let field of ['forename', 'surname']) {
    user[field] = req.body[field] || null;
  }

  user.save()
    .then((user) => {
      res.json(user);
    })
    .catch(next);
});

app.patch('/users/:userId(\\d+)', bodyParser.json(), (req, res, next) => {
  let user = req.user;

  for (let field of ['forename', 'surname']) {
    if (req.body[field]) {
      user[field] = req.body[field];
    }
  }

  user.save()
    .then((user) => {
      res.json(user);
    })
    .catch(next);
});

app.delete('/users/:userId(\\d+)', (req, res, next) => {
  req.user.destroy()
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = app;
