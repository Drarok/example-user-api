const request = require('supertest');

const app = require('../src/app');
const models = require('../src/models');

describe('Create test app', () => {
  beforeEach(() => {
    return models.conn
      .sync({ force: true })
      .then(() => {
        server = app;
      })
  });

  it('GET /users starts with empty array', () => {
    return request(app)
      .get('/users')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect([]);
  });

  it('GET /users returns all users', () => {
    const data = [
      {
        email: 'mat@example.com',
        forename: 'Mat',
        surname: 'Gadd',
      },
      {
        email: 'foo@example.com',
        forename: 'Foo',
        surname: 'Bar',
      },
    ];

    // Create two users directly in the database
    const users = Promise.all(data.map((u) => {
      return models.User.create(u);
    }));

    return users
      .then(() => {
        return request(app)
          .get('/users')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect((res) => {
            if (res.body.length !== 2) {
              throw new Error('Incorrect user count');
            }
          });
      });
  });

  it('GET /users/:userId returns 404 with no data', () => {
    return request(app)
      .get('/users/1')
      .expect(404);
  });

  it('POST /users creates a user', () => {
    let data = {
      email: 'mat@example.com',
      forename: 'Mat',
      surname: 'Gadd',
    };

    return request(app)
      .post('/users')
      .send(data)
      .expect(201)
      .expect('Location', '/users/1')
      .expect((res) => {
        const errors = [];
        for (let field in data) {
          if (res.body[field] !== data[field]) {
            errors.push(`${field} mismatch in response`);
          }
        }

        if (errors.length) {
          throw new Error(errors.join(', '));
        }
      })
      .expect(() => {
        return models.User.findAll()
          .then((users) => {
            if (users.length !== 1) {
              throw new Error('User does not exist in the database');
            }

            const errors = [];
            for (let field in data) {
              if (users[0][field] !== data[field]) {
                errors.push(`${field} mismatch in database`);
              }
            }
          });
      });
  });
});
