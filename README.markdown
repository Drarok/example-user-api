# User API [![Build Status](https://travis-ci.org/Drarok/example-user-api.svg?branch=develop)](https://travis-ci.org/Drarok/example-user-api)

This project is a simple API, managing a user persistence layer.

Note that this only persists to an in-memory SQLite database, so restarting the service will delete all data.

## Getting Started

It is expected you are using [nvm][nvm] and [yarn][yarn], though it should work ok with NPM, too.

1. `git clone <this repo> user-api`
2. `cd user-api`
3. `yarn install`
4. `yarn test`
5. `yarn start`

By default, this API starts an HTTP server on port 4000, which you can change via the `API_PORT` environment variable:

```
API_PORT=5000 yarn start
```

## API

### POST /users

Request:
```json
POST /users
{
    "forename": "Mat",
    "surname": "Gadd",
    "email": "mat@example.com"
}
```

Response:
```json
HTTP/1.1 201 Created
Location: /users/1

{
    "id": 1,
    "created": "2018-01-01T19:10:34.035Z",
    "email": "mat@example.com",
    "forename": "Mat",
    "surname": "Gadd"
}
```

### GET /users

Request:
```json
GET /users
```

Response:
```json
HTTP/1.1 200 OK

[
    {
        "id": 1,
        "created": "2018-01-01T19:10:34.035Z",
        "email": "mat@example.com",
        "forename": "Mat",
        "surname": "Gadd"
    },
    {
        "id": 2,
        "created": "2018-01-01T19:12:28.701Z",
        "email": "foo@example.com",
        "forename": "Foo",
        "surname": "Bar"
    }
]
```


### GET /users/:userId

Request:
```json
GET /users/1
```

Response:
```json
HTTP/1.1 200 OK

{
    "id": 1,
    "created": "2018-01-01T19:10:34.035Z",
    "email": "mat@example.com",
    "forename": "Mat",
    "surname": "Gadd"
}
```

### PATCH /users/:userId

A `PATCH` request allows you to send only what needs to change to the server.

**Note: Only changing `forename` and `surname` is currently supported**

Request:
```json
PATCH /users/1

{
    "forename": "Matthew"
}
```

Response:
```json
HTTP/1.1 200 OK

{
    "id": 1,
    "created": "2018-01-01T19:10:34.035Z",
    "email": "mat@example.com",
    "forename": "Matthew",
    "surname": "Gadd"
}
```

### PUT /users/:userId

A `PUT` request replaces the object on the server with the sent request body.

**Note: Only changing `forename` and `surname` is currently supported**

Request:
```json
PUT /users/1

{
    "forename": "Matthew"
}
```

Response:
```json
HTTP/1.1 200 OK

{
    "id": 1,
    "created": "2018-01-01T19:10:34.035Z",
    "email": "mat@example.com",
    "forename": "Matthew",
    "surname": null
}
```

### DELETE /users/:userId

Request:
```json
DELETE /users/1
```

Response:
```json
HTTP/1.1 204 No Content
```

[nvm]: https://github.com/creationix/nvm
[yarn]: https://yarnpkg.com/lang/en/
