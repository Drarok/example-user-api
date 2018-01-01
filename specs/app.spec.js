const assert = require('assert');

const request = require('supertest');

const app = require('../src/app');
const models = require('../src/models');

const testUsers = [
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

describe('Test users API', () => {
  // Empty and re-create the database before each test.
  beforeEach(() => {
    return models.conn
      .sync({ force: true });
  });

  describe('GET /users', () => {
    it('starts with empty array', () => {
      return request(app)
        .get('/users')
        .expect(200)
        .expect([]);
    });

    it('returns all users', () => {
      return Promise
        .all(testUsers.map((u) => {
          return models.User.create(u)
        }))
        .then(() => {
          return request(app)
            .get('/users')
            .expect(200)
            .expect((res) => {
              assert.equal(res.body.length, 2, 'Incorrect user count');
            });
        });
    });
  });

  describe('GET /users/:userId', () => {
    it('returns 404 with no data', () => {
      return request(app)
        .get('/users/1')
        .expect(404);
    });

    it('returns valid user data', () => {
      const user = testUsers[0];

      return models.User.create(user)
        .then(() => {
          return request(app)
            .get('/users/1')
            .expect(200)
            .expect((res) => {
              const errors = [];
              for (let field in user) {
                if (res.body[field] !== user[field]) {
                  errors.push(`${field} mismatch in response`);
                }
              }

              if (errors.length) {
                throw new Error(errors.join(', '));
              }
            });
        });
    });
  });

  describe('POST /users', () => {
    it('creates a user', () => {
      let user = testUsers[0];

      return request(app)
        .post('/users')
        .send(user)
        .expect(201)
        .expect('Location', '/users/1')
        .expect((res) => {
          const errors = [];
          for (let field in user) {
            if (res.body[field] !== user[field]) {
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
              assert(users.length, 1, 'User does not exist in the database');

              const errors = [];
              for (let field in user) {
                if (users[0][field] !== user[field]) {
                  errors.push(`${field} mismatch in database`);
                }
              }

              if (errors.lenth) {
                throw new Error(errors.join(', '));
              }
            });
        });
    });
  });

  describe('PATCH /users/:userId', () => {
    it('returns 404 with no data', () => {
      return request(app)
        .patch('/users/1')
        .send({})
        .expect(404);
    });

    it('updates only given data', () => {
      const user = testUsers[0];
      const update = {
        surname: 'Smith',
      };

      const expected = {
        email: 'mat@example.com',
        forename: 'Mat',
        surname: 'Smith',
      };

      return models.User.create(user)
        .then(() => {
          return request(app)
            .patch('/users/1')
            .send(update)
            .expect(200)
            .expect((res) => {
              for (let field in expected) {
                assert.equal(res.body[field], expected[field]);
              }
            });
        });
    });
  });

  describe('PUT /users/:userId', () => {
    it('returns 404 with no data', () => {
      return request(app)
        .put('/users/1')
        .send({})
        .expect(404);
    });

    it('updates all data', () => {
      const user = testUsers[0];
      const update = {
        surname: 'Smith',
      };

      const expected = {
        email: 'mat@example.com',
        forename: null,
        surname: 'Smith',
      };

      return models.User.create(user)
        .then(() => {
          return request(app)
            .put('/users/1')
            .send(update)
            .expect(200)
            .expect((res) => {
              for (let field in expected) {
                assert.equal(res.body[field], expected[field]);
              }
            });
        });
    });
  });

  describe('DELETE /users/:userId', () => {
    it('returns 404 with no data', () => {
      return request(app)
        .delete('/users/1')
        .expect(404);
    });

    it('deletes given user', () => {
      const user = testUsers[0];

      return models.User.create(user)
        .then(() => {
          return request(app)
            .delete('/users/1')
            .expect(204)
            .expect(() => {
              return models.User.findAll()
                .then((users) => {
                  assert.equal(users.length, 0);
                });
            });
        });
    });
  });
});
