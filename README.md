# Neko.DB-Socket
> Is an online database socket package that is very easy to setup and connect.

----
## Usage
### Client Class
- `Client(config)`
> To make a new client with a config.
- `Client#connect()`
> To connect to the server with current setting.
- `Client#get(key, callback)`
> To get `key`'s value and then call `callback` with `key`'s value as argument. If `callback` is not a function, the code will return the value. This will throw an error if the client haven't connect to the server.
- `Client#on(event, callback)`
> To add a callback to an event. This will return an `id` of the callback.
- `Client#once(event, callback)`
> This is same with `Client#on` but the callback can only be used once.
- `Client#off(id)`
> To remove a callback by `id`.
- `Client#register()`
> To register the account to the server. This will not throw an error if the account is exist.
- `Client#set(key, value, callback)`
> To set `key`'s value into `value`. If `callback` is a function, the code will call `calback` with `key`'s new value as argument. If `callback` is not a function, the code will return the new value. This will throw an error if the client haven't connect to the server.
----
### Server Class
----
- `Server(httpApp/port, config)`
> To make new socket server. (The arguments are same with socket.io's class).
- `Server#on(event, callback)`
> To add a callback to an event. This will return an `id` of the callback.
- `Server#once(event, callback)`
> This is same with `Server#on` but the callback can only be used once.
- `Server#off(id)`
> To remove a callback by `id`.

----
## Example
### Client Example
----
```js
let { Client } = require("../index.js");
let client     = new Client({
  url    : "http://localhost:3000",
  account: {
    username: "Admin23",
    password: "admin123"
  }
});

client.on("connected", async () => {
  console.log(`Connected as ${client.connection.account.username}.`);
  let count = await client.get("count");
  switch(count) {
	case undefined:
	  count = 1;
	  await client.set("count", count);
	  break;
	default:
	  count+=1;
	  await client.set("count", count);
	  break;
  }
  console.log(count);
  client.on("disconnected", () => {
    console.log(`Disconnected.`);
  });
});

let connect = () => {
  client.connect();
};

client.on("registered", connect);
client.on("alreadyRegistered", connect);

setTimeout(function() {
  client.register();
}, 1000);
```
----
### Server Example
----
```js
let { Server } = require("../index.js");
let http       = require("http").createServer();
let server     = new Server(http);

http.listen(3000, () => {
  console.log("Listening at localhost:3000");
});

server.on("connection", (data) => {
  console.log(`A user is connected to the server.`);
});

server.on("register", (data) => {
  console.log(`A user is registered it's account.`);
});

server.on("registering", data => {
  return { status: false, reason: "You dumb" };
});

server.on("connecting", data => {
  return { status: false, reason: "You dumb" };
});
```
----

## Note
> You can get all `Client#on` and `Server#on` events in `test/note.txt`.

---

## Donation
> PayPal: `nekomaru76`

----
## Support
> [Discord Server](https://discord.gg/pes8Wbu)

----

## Developer
> Gaia#7541 (Discord)

----

## Copyright (c) EvoDev Team, Inc - All Rights Reserved
 * This work is licensed under the Recex Shared Source License Version 1.0. 
 * To view a copy of this license, visit [the site](https://raw.githubusercontent.com/Recex/Licenses/master/SharedSourceLicense/LICENSE.txt).
 * Written by Gaia <careday17@gmail.com>, October 2020.
 ---