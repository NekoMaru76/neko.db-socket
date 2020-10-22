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