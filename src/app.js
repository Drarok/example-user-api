const bodyParser = require('body-parser');
const express = require('express');
const Sequelize = require('sequelize');

const models = require('./models');

const app = express();

function safeString(str) {
  if (typeof str !== 'string') {
    return '';
  }

  return str.trim();
}

class UserValidationError extends Error {
}

function validateUser(user, requireEmail) {
  return new Promise((resolve, reject) => {
    var fields = [
      'forename',
      'surname'
    ];

    if (requireEmail) {
      fields.push('email');
    }

    let errors = [];

    for (let field of fields) {
      user[field] = safeString(user[field]);

      if (user[field].length === 0) {
        errors.push(field);
      }
    }

    if (errors.length > 0) {
      return reject(new UserValidationError('Missing required fields: ' + errors.join(', ')));
    }

    resolve(user);
  });
}

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

  return validateUser(data, true)
    .then((user) => {
      return models.User.create(user, { fields })
    })
    .then((user) => {
      res.status(201)
        .location(`/users/${user.id}`)
        .json(user);
    })
    .catch(next);
});

app.put('/users/:userId(\\d+)', bodyParser.json(), (req, res, next) => {
  let user = req.user;

  for (let field of ['forename', 'surname']) {
    user[field] = req.body[field] || null;
  }

  validateUser(user)
    .then((user) => {
      return user.save();
    })
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

// Custom error handling.
app.use((err, req, res, next) => {
  if (err instanceof UserValidationError) {
    return res.status(400).json({ error: err.message });
  } else if (err instanceof Sequelize.ValidationError) {
    for (const error of err.errors) {
      if (error.type === 'unique violation' && error.path === 'email') {
        return res.status(400).json({ error: 'Email address already exists' });
      }
    }
  }

  res.status(500).json({ error: err.message });
});

module.exports = app;
