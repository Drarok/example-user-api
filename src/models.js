const Sequelize = require('sequelize');

const conn = new Sequelize('sqlite::memory:');

const User = conn.define(
  'user',
  {
    created: Sequelize.DATE,
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    forename: Sequelize.STRING,
    surname: Sequelize.STRING,
  },
  {
    timestamps: false
  }
);

module.exports = {
  conn,
  User
};
