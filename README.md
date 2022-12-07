# a99-group-05: Spin the Wheel!

A NodeJS/Express REST API that serves up coin flips

This was developed from in-class demos for UNC COMP 426 Spring 2022.

# Install and run instructions

This currently works on Node v16.x.x (current iteration developed on v16.15.0).

To install, clone this repository and then run `npm install` inside the directory.
This will install all dependencies.

To run for debugging, run `npm test`. It will listen on port 5555.

To run, use `npm start` and the server will listen on whatever port is configured in `.env` or default to 5000. 

To run on a specific port either change `PORT=` in `.env` or use `node index.js --port=PORT_NUMBER`.

`node index.js --help` shows all currently-implemented options.

# Coinserver API Documentation

## Endpoints

### /app/

Responds "200 OK"

#### Response body

```
curl http://localhost:5000/app/
```
```json
{"message":"Your API works! (200)"}
```

### /app/spin

Makes a bet, spins the wheel, and updates user balance

#### Response body - FIX THIS WHEN SPIN WORKS

```
curl http://localhost:5000/app/spin
```
```json
{"message":"Your API works! (200)"}
```

### /app/new/user

Takes user input parameters, creates a new user, and stores it in the user database.

#### Response body

```
curl -X POST -d '{"user": "daddy", "pass": "mommy", "bal": "1000"}' -H 'Content-Type: application/json' http://localhost:5000/app/new/user
```
```json
{"changes":"0 if not changed, 1 if changed", "lastInserRowid": "DB Row ID of users added"}
```

### /app/users

Displays all users in the user database.

#### Response body

```
curl http://localhost:5000/app/users
```
```json
{"id":"user id", "username": "username", "password": "password", "balance": "balance"} for each user in DB
```

### /app/user/:id

Takes user id as input and outputs the user's information stored in the user DB.

#### Response body

```
curl http://localhost:5000/app/user/:id (replace :id with actual user id)
```
```json
{"id":"user id", "username": "username", "password": "password", "balance": "balance"} for that specific user
```

### /app/update/user/:id

Takes user id, new username, and new password as inputs and outputs the user's information stored in the user DB.

#### Response body

```
curl -X PATCH -d '{"username": "new username", "password": "new password"}' -H 'Content-Type: application/json' http://localhost:5000/app/update/user/:id (replace :id with user id to change)
```
```json
{"changes":"0 if not changed, 1 if changed", "lastInserRowid": "DB Row ID of users updated"}
```

### /app/update/user/:id - FIX THIS ONCE BALANCE IS UPDATED

Takes user id and new balance as inputs and outputs the user's information stored in the user DB.

#### Response body

```
curl -X PATCH -d '{"balance": "new balance"}' -H 'Content-Type: application/json' http://localhost:5000/app/update/user/:id (replace :id with user id to change)
```
```json
{"changes":"0 if not changed, 1 if changed", "lastInserRowid": "DB Row ID of users updated"}
```

### /app/delete/user/:id

Takes user id as input and deletes the user.

#### Response body

```
curl -X DELETE http://localhost:5000/app/delete/user/:id (replace :id with user id to change)
```
```json
{"changes":"0 if not changed, 1 if changed", "lastInserRowid": "DB Row ID of user deleted"}
```