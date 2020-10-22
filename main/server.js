/* Copyright (c) EvoDev Team, Inc - All Rights Reserved.
 * This work is licensed under the Recex Shared Source License Version 1.0. 
 * To view a copy of this license, visit https://raw.githubusercontent.com/Recex/Licenses/master/SharedSourceLicense/LICENSE.txt.
 * Written by Gaia <careday17@gmail.com>, October 2020.
 */

const fs  = require("fs");
const set = require("lodash/set");
const get = require("lodash/get");
const uid = require("cuid");

const em = new (require("@evodev/eventemitter"));
const emitEvent = em.emit.bind(em);
const getEvent = em.get.bind(em);
const offEvent = em.off.bind(em);
const onEvent = (n,c,o) => {
  if (o) return em.once.bind(em)(n,c);
  else return em.on.bind(em)(n,c);
};

let data = {"accounts": []};

if (fs.existsSync("./db.json")) data = JSON.parse(fs.readFileSync("./db.json", "utf8"));
else save();

if (!data.accounts) data.accounts = {}, save();

function save() {
  fs.writeFileSync("./db.json", JSON.stringify(data));
}

class Server {
  constructor() {
    this.io = require("socket.io")(...arguments);
    this.io.on("connection", socket => {
      socket.once("auth", acc => {
        for (let i = 0; i < data.accounts.length; i++) {
          let account = data.accounts[i];
          if (account.username === acc.username) {
            if (account.password !== acc.password) return socket.emit("res.auth", 403);
            let cbs = getEvent("connecting");
			if (cbs) {
			  for (let i = 0; i < cbs.length; i++) {
			    let r = cbs[i].callback({ account: acc, socket: socket });
		        if (cbs[i].once) cbs[i] = undefined;
		        if (!r) throw new Error(`Invalid callback return.`);
		        if (!r.status) return socket.emit("res.auth", { error: 407, reason: r.reason });
			  }
		      cbs = cbs.filter(c => c ? true : false);
			}
			socket.on("set", (d) => {
              if (!d.key) return socket.emit(`res.set.${d.id}`, 404);
              if (typeof d.key !== "string") return socket.emit(`res.set.${d.id}`, 406);
              if (!d.value) return socket.emit(`res.set.${d.id}`, 405);
              let r;
              try {
                r = set(account.database, d.key, d.value);
              } catch(err) {}
              socket.emit(`res.set.${d.id}`, r);
              save();
            });
            socket.on("get", (d) => {
              if (!d.key) return socket.emit(`res.get.${d.id}`, 404);
              if (typeof d.key !== "string") return socket.emit(`res.get.${d.id}`, 406);
              let r;
              try {
                r = get(account.database, d.key);
              } catch(err) {}
              socket.emit(`res.get.${d.id}`, r);
            });
			emitEvent("connection", { socket: socket, account: acc });
            return socket.emit("res.auth", 100);
          }
        }
        return socket.emit("res.auth", 402);
      });
      socket.on("register", acc => {
        for (let i = 0; i < data.accounts.length; i++) {
          let account = data.accounts[i];
          if (account.username === acc.username) return socket.emit("res.register", 402);
        }
		let cbs = getEvent("registering");
		if (cbs) {
		  for (let i = 0; i < cbs.length; i++) {
		    let r = cbs[i].callback({ account: acc, socket: socket });
		    if (cbs[i].once) cbs[i] = undefined;
		    if (!r) throw new Error(`Invalid callback return.`);
		    if (!r.status) return socket.emit("res.register", { error: 407, reason: r.reason });
		  }
		  cbs = cbs.filter(c => c ? true : false);
		}
        data.accounts.push({
          username: acc.username,
          password: acc.password,
          database: {}
        });
        save();
		emitEvent("register", { account: acc, socket: socket });
        return socket.emit("res.register", 101);
      });
    });
  }
  on(name, callback) {
	return onEvent(name, callback, false);
  }
  once(name, callback) {
	return onEvent(name, callback, true);
  }
  off(id) {
	return offEvent(id);
  }
}

module.exports = Server;

/* Copyright (c) EvoDev Team, Inc - All Rights Reserved.
 * This work is licensed under the Recex Shared Source License Version 1.0. 
 * To view a copy of this license, visit https://raw.githubusercontent.com/Recex/Licenses/master/SharedSourceLicense/LICENSE.txt.
 * Written by Gaia <careday17@gmail.com>, October 2020.
 */