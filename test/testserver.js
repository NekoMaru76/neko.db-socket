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